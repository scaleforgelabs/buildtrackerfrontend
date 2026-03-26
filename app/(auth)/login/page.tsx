'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Images } from '@/public'
import Image from 'next/image'
import { useAuth } from '@/libs/hooks/useAuth'
import { authService } from '@/libs/api/auth'
import GoogleLoginButton from '@/app/components/auth/GoogleLoginButton'
import AppleLoginButton from '@/app/components/auth/AppleLoginButton'
import { toast } from 'sonner'

const LoginPageContent = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const inviteToken = searchParams.get('invite_token') || ''
    const { login } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await login(email, password)

            // If there's a pending workspace invitation, accept it
            if (inviteToken) {
                try {
                    // Fetch invitation details first to verify email
                    const inviteRes = await authService.getInvitationDetails(inviteToken)
                    const invitedEmail = inviteRes.data.invitation.email

                    if (invitedEmail.toLowerCase() === email.toLowerCase()) {
                        const response = await authService.acceptWorkspaceInvitation(inviteToken)
                        const workspaceId = response.data.workspace?.id
                        if (workspaceId) {
                            toast.success(`Successfully joined ${response.data.workspace.name}!`)
                            router.push(`/${workspaceId}/home`)
                            return
                        }
                    } else {
                        console.warn('Invitation email mismatch, skipping auto-accept')
                    }
                } catch (inviteErr) {
                    console.error('Failed to accept invitation:', inviteErr)
                    // Still redirect to home even if invitation acceptance fails
                }
            }

            // Redirect to last workspace if available
            const lastWorkspaceId = localStorage.getItem('lastWorkspaceId');
            if (lastWorkspaceId) {
                router.push(`/${lastWorkspaceId}/home`);
            } else {
                router.push('/home');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mx-auto w-full max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-6 flex h-10 w-10 items-center justify-center">
                    <Image src={Images.logo} alt="" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-foreground">Welcome Back</h1>
                <p className="text-sm text-muted-foreground">
                    Log in to continue shopping, track your orders, and access your personalized dashboard. We&apos;re glad to have you back!
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground">Your email</label>
                    <Input
                        type="email"
                        placeholder="aoson@theasbuild.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground">Enter Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button
                    type="submit"
                    className="mt-2 w-full text-base"
                    size="lg"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Log in'}
                </Button>
            </form>

            {/* Divider */}
            <div className="mb-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-sm text-muted-foreground">or continue with</span>
                <div className="h-px flex-1 bg-border"></div>
            </div>

            {/* Social Login */}
            <div className="flex flex-col gap-3">
                <GoogleLoginButton
                    label="Login with Google"
                    onError={(err) => setError(err)}
                />
                <AppleLoginButton
                    label="Login with Apple"
                    onError={(err) => setError(err)}
                />
            </div>

            <div className="mt-6 text-left text-sm font-medium text-muted-foreground">
                Don&apos;t have an account? <Link href={inviteToken ? `/invite?token=${inviteToken}` : '/signup'} className="text-primary hover:underline">Sign up</Link>
            </div>
            <div className="mt-6 text-left text-sm font-medium text-muted-foreground">
                forgotten your password? <Link href="/forgot-password" className="text-primary hover:underline">click here </Link>
            </div>
        </div>
    )
}

const LoginPage = () => (
    <Suspense fallback={<div className="mx-auto w-full max-w-2xl p-8 text-center text-muted-foreground">Loading...</div>}>
        <LoginPageContent />
    </Suspense>
)

export default LoginPage