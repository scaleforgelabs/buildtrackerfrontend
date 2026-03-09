'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/libs/api/auth';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

declare global {
    interface Window {
        AppleID?: {
            auth: {
                init: (config: any) => void;
                signIn: () => Promise<any>;
            };
        };
    }
}

interface AppleLoginButtonProps {
    label?: string;
    onError?: (error: string) => void;
}

const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || 'com.buildtrackerapp.web';

export default function AppleLoginButton({ label = 'Continue with Apple', onError }: AppleLoginButtonProps) {
    const router = useRouter();
    const searchParams = useSearchParams()
    const inviteToken = searchParams.get('invite_token') || searchParams.get('token') || ''
    const [loading, setLoading] = useState(false)
    const [initialized, setInitialized] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const scriptId = 'apple-login-script';
        if (document.getElementById(scriptId)) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        script.async = true;
        script.onload = () => {
            console.log('Apple SDK Script loaded');
            setScriptLoaded(true);
        };
        script.onerror = () => {
            console.error('Failed to load Apple SDK');
            onError?.('Failed to load Apple SDK');
        };
        document.head.appendChild(script);
    }, [onError]);

    useEffect(() => {
        if (!scriptLoaded || !window.AppleID || initialized) return;

        try {
            console.log('Initializing Apple ID with Client ID:', APPLE_CLIENT_ID);
            window.AppleID.auth.init({
                clientId: APPLE_CLIENT_ID,
                scope: 'name email',
                redirectURI: window.location.origin + '/login',
                usePopup: true,
            });
            setInitialized(true);
            console.log('Apple ID initialized successfully');
        } catch (err) {
            console.error('Apple ID initialization failed:', err);
        }
    }, [scriptLoaded, initialized]);

    const handleAppleLogin = async () => {
        if (!initialized || !window.AppleID) {
            console.warn('Apple Sign-In is not initialized, attempting init now...');
            if (window.AppleID) {
                window.AppleID.auth.init({
                    clientId: APPLE_CLIENT_ID,
                    scope: 'name email',
                    redirectURI: window.location.origin + '/login',
                    usePopup: true,
                });
                setInitialized(true);
            } else {
                onError?.('Apple Sign-In SDK not loaded yet. Please wait a moment.');
                return;
            }
        }

        setLoading(true);
        try {
            const data = await window.AppleID.auth.signIn();
            const id_token = data.authorization.id_token;

            const result = await authService.appleLogin(id_token);
            const { access, refresh } = result.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Handle pending invitation if any
            if (inviteToken) {
                try {
                    const loggedInEmail = result.data.email;

                    const inviteRes = await authService.getInvitationDetails(inviteToken);
                    const invitedEmail = inviteRes.data.invitation.email;

                    if (loggedInEmail.toLowerCase() === invitedEmail.toLowerCase()) {
                        const response = await authService.acceptWorkspaceInvitation(inviteToken);
                        const workspaceId = response.data.workspace?.id;
                        if (workspaceId) {
                            toast.success(`Successfully joined ${response.data.workspace.name}!`);
                            router.push(`/${workspaceId}/home`);
                            return;
                        }
                    } else {
                        toast.warning(`Invitation skipped. It was sent to ${invitedEmail}, but you logged in as ${loggedInEmail}.`);
                        console.warn('Apple login email mismatch with invitation, skipping auto-accept');
                    }
                } catch (inviteErr) {
                    console.error('Failed to auto-accept invitation after Apple login:', inviteErr);
                }
            }

            router.push('/home');
        } catch (error: any) {
            console.error('Apple login error:', error);
            if (error.error !== 'user_cancelled') {
                onError?.(error.response?.data?.error || 'Apple login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-2 font-normal text-muted-foreground hover:text-foreground"
            onClick={handleAppleLogin}
            disabled={loading}
        >
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.96.95-2.04 1.72-3.23 2.3-.96.47-1.95.81-2.96 1s-2.01.27-2.99.19c-.98-.08-1.93-.27-2.85-.56s-1.78-.68-2.58-1.18c-.8-.5-1.54-1.1-2.21-1.8s-1.22-1.5-1.66-2.4c-.44-.9-.75-1.9-.94-2.99s-.19-2.25.01-3.41c.21-1.16.63-2.28 1.25-3.35.62-1.07 1.45-2.01 2.47-2.81s2.21-1.4 3.55-1.81c1.34-.41 2.81-.6 4.39-.56.81.02 1.63.14 2.45.36s1.61.54 2.37.95 1.46.91 2.08 1.5 1.15 1.25 1.57 1.99c-1.35.8-2.39 1.9-3.11 3.29s-1.08 2.92-1.08 4.59.36 3.19 1.08 4.58 1.77 2.5 3.12 3.3c-.3.5-.66 1-1.08 1.5zM12.03 7.25c-.21 0-.42-.01-.62-.02.44-2.5 1.63-4.5 3.59-6 .31-.24.64-.46.99-.65.23-.13.48-.24.74-.32s.53-.13.8-.15c.02.21.03.42.02.63-.03 1-.22 2-.57 2.95s-.86 1.83-1.52 2.63-1.46 1.48-2.39 2.02c-.93.54-1.96.84-3.04.91z" />
            </svg>
            {loading ? 'Connecting...' : label}
        </Button>
    );
}
