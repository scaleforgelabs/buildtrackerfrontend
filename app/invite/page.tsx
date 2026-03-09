'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, Shield, Loader2 } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Images } from '@/public'
import { authService } from '@/libs/api/auth'
import GoogleLoginButton from '@/app/components/auth/GoogleLoginButton'
import AppleLoginButton from '@/app/components/auth/AppleLoginButton'

interface InvitationInfo {
    email: string
    role: string
    invited_by: string
    workspace_name: string
    workspace_description: string
}

function InvitePageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token') || ''

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [fetchingInvite, setFetchingInvite] = useState(true)
    const [error, setError] = useState('')
    const [inviteInfo, setInviteInfo] = useState<InvitationInfo | null>(null)

    useEffect(() => {
        if (token) {
            fetchInvitationDetails()
        } else {
            setFetchingInvite(false)
        }
    }, [token])

    const fetchInvitationDetails = async () => {
        try {
            const response = await authService.getInvitationDetails(token)
            const { invitation, workspace } = response.data
            setInviteInfo({
                email: invitation.email,
                role: invitation.role,
                invited_by: invitation.invited_by,
                workspace_name: workspace.name,
                workspace_description: workspace.description
            })
            setFormData(prev => ({ ...prev, email: invitation.email }))
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid invitation. Please check the link.')
        } finally {
            setFetchingInvite(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const [first_name, ...lastNameParts] = formData.fullName.split(' ')
            const last_name = lastNameParts.join(' ')

            if (token) {
                await authService.registerWithWorkspaceInvitation({
                    email: formData.email,
                    password: formData.password,
                    first_name,
                    last_name,
                    invitation_token: token
                })
                router.push(`/otp-verification?email=${encodeURIComponent(formData.email)}&invite_token=${token}`)
            } else {
                await authService.register({
                    email: formData.email,
                    password: formData.password,
                    first_name,
                    last_name
                })
                router.push(`/otp-verification?email=${encodeURIComponent(formData.email)}`)
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    if (fetchingInvite) {
        return (
            <div className="flex h-screen items-center justify-center bg-muted/40 p-4 md:p-9">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading invitation...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen items-center justify-center bg-muted/40 p-4 md:p-9">
            <div className="flex w-full h-full gap-6 overflow-hidden">
                {/* Left Side - Hero/Branding */}
                <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden rounded-3xl p-8 lg:flex">
                    {/* Gradient Background */}
                    <div
                        className="absolute inset-0 bg-blue-500"
                        style={{
                            background: `
                    radial-gradient(circle at top left, #a5bbf5 0%, #4372e9 100%),
                    linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(255,255,255,0) 100%)
                `
                        }}
                    >
                        {/* Blur Effect Overlay */}
                        <div className="absolute inset-0 backdrop-blur-3xl"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="flex h-12 w-12 items-center justify-center rounded text-primary">
                                <Image src={Images.logo} alt={''} />
                            </div>
                            <span className="text-3xl font-semibold text-foreground">BuildTracker</span>
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto">
                        <p className="mb-4 text-xl font-medium text-foreground/80">Management made Simple.</p>
                        <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                            Facilitate clear task organization and efficient completion for teams.
                        </h1>
                    </div>
                </div>

                {/* Right Side - Form Content */}
                <div className="flex w-full flex-col justify-center rounded-3xl bg-card p-8 shadow-sm lg:w-1/2 lg:p-12">
                    <div className="mx-auto w-full max-w-2xl">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="mb-6 flex h-10 w-10 items-center justify-center">
                                <Image src={Images.logo} alt="" />
                            </div>
                            <h1 className="mb-2 text-3xl font-bold text-foreground">
                                {inviteInfo ? 'Join Workspace' : 'Create an account'}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {inviteInfo
                                    ? `${inviteInfo.invited_by} has invited you to join a workspace. Create an account to get started.`
                                    : 'Join thousands of teams managing their build pipelines with ease. Start your free trial today and experience the difference.'
                                }
                            </p>
                        </div>

                        {/* Workspace Info Card */}
                        {inviteInfo && (
                            <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">{inviteInfo.workspace_name}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                            <Shield className="h-3 w-3" />
                                            <span>Role: {inviteInfo.role}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-foreground">Your full name</label>
                                <Input
                                    type="text"
                                    name="fullName"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-foreground">Your email</label>
                                <Input
                                    type="email"
                                    name="email"
                                    placeholder="John@doe.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={!!inviteInfo}
                                    className={inviteInfo ? 'bg-muted text-muted-foreground' : ''}
                                />
                                {inviteInfo && (
                                    <p className="text-xs text-muted-foreground">Email must match the invitation</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-foreground">Enter Password</label>
                                <Input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="mt-2 w-full text-base"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? 'Creating account...' : inviteInfo ? 'Create Account & Join' : 'Sign up'}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="mb-6 flex items-center gap-4">
                            <div className="h-px flex-1 bg-border"></div>
                            <span className="text-sm text-muted-foreground">or continue with</span>
                            <div className="h-px flex-1 bg-border"></div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <GoogleLoginButton
                                label={inviteInfo ? "Join with Google" : "Sign up with Google"}
                                onError={(err) => setError(err)}
                            />
                            <AppleLoginButton
                                label={inviteInfo ? "Join with Apple" : "Sign up with Apple"}
                                onError={(err) => setError(err)}
                            />
                        </div>

                        <div className="mt-6 text-left text-sm font-medium text-muted-foreground">
                            Already have an account?{' '}
                            <Link
                                href={token ? `/login?invite_token=${token}` : '/login'}
                                className="text-primary hover:underline"
                            >
                                Log in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function InvitePage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-muted/40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <InvitePageContent />
        </Suspense>
    )
}
