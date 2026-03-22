'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/libs/api/auth';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    prompt: (callback?: (notification: any) => void) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                    cancel: () => void;
                };
            };
        };
    }
}

interface GoogleLoginButtonProps {
    label?: string;
    onError?: (error: string) => void;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function GoogleLoginButton({ label = 'Login with Google', onError }: GoogleLoginButtonProps) {
    const router = useRouter();
    const hiddenBtnRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams()
    const inviteToken = searchParams.get('invite_token') || searchParams.get('token') || ''
    const [loading, setLoading] = useState(false)
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const handleCredentialResponse = useCallback(async (response: any) => {
        setLoading(true);
        try {
            const result = await authService.googleLogin(response.credential);
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
                        console.warn('Google login email mismatch with invitation, skipping auto-accept');
                    }
                } catch (inviteErr) {
                    console.error('Failed to auto-accept invitation after Google login:', inviteErr);
                }
            }

            router.push('/home');
        } catch (error: any) {
            console.error('Google login error:', error);
            onError?.(error.response?.data?.error || 'Google login failed');
        } finally {
            setLoading(false);
        }
    }, [router, onError]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;

        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            setScriptLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => setScriptLoaded(true);
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (!scriptLoaded || !window.google || !GOOGLE_CLIENT_ID || !hiddenBtnRef.current) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            ux_mode: 'popup',
        });

        // Ensure the button spans full width 
        const containerWidth = hiddenBtnRef.current.parentElement?.offsetWidth || 300;

        window.google.accounts.id.renderButton(hiddenBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: containerWidth,
            logo_alignment: 'center'
        });
    }, [scriptLoaded, handleCredentialResponse]);

    return (
        <div className="relative w-full h-11 overflow-hidden rounded-md group">
            {/* Custom styled button (Visuals only) */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full h-full gap-2 font-normal text-muted-foreground group-hover:bg-muted group-hover:text-foreground border-input"
                    disabled={loading || !scriptLoaded}
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {loading ? 'Connecting...' : label}
                </Button>
            </div>

            {/* Invisible Google GIS Button that actually gets clicked */}
            <div
                ref={hiddenBtnRef}
                className="absolute left-0 right-0 top-0 bottom-0 z-10 cursor-pointer overflow-hidden flex items-center justify-center opacity-[0.01]"
                title={label}
            />
        </div>
    );
}
