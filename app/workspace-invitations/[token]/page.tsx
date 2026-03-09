'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { Building2, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/app/components/ui/card'
import { AvatarStack } from '@/app/components/ui/avatar-stack'
import { Separator } from '@radix-ui/react-select'
import { Button } from '@/app/components/ui/button'
import { Images } from '@/public'
import { authService } from '@/libs/api/auth'
import { toast } from 'sonner'
import { workspacesService } from '@/libs/api/services'

interface InvitationData {
    invitation: {
        id: string
        email: string
        role: string
        phone: string
        job_role: string
        expires_at: string
        invited_by: string
    }
    workspace: {
        id: string
        name: string
        description: string
        type: string
        member_count?: number
    }
    user_exists: boolean
    registration_required: boolean
}

interface UserWorkspace {
    id: string
    name: string
    members?: Array<{ avatar?: string }>
    member_count?: number
}

export default function WorkspaceInvitationPage() {
    const router = useRouter()
    const params = useParams()
    const token = params.token as string

    const [loading, setLoading] = useState(true)
    const [accepting, setAccepting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [data, setData] = useState<InvitationData | null>(null)
    const [userWorkspaces, setUserWorkspaces] = useState<UserWorkspace[]>([])
    const [userEmail, setUserEmail] = useState('')
    const [userName, setUserName] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        if (token) loadAll()
    }, [token])

    const loadAll = async () => {
        const accessToken = localStorage.getItem('access_token')
        setIsLoggedIn(!!accessToken)

        // Fetch invitation details (public endpoint)
        try {
            const inviteRes = await authService.getInvitationDetails(token)
            setData(inviteRes.data)
        } catch (err: any) {
            const errorData = err.response?.data
            if (errorData?.expired) {
                setError('This invitation has expired. Please ask the workspace admin to send a new one.')
            } else if (errorData?.status === 'accepted') {
                setError('This invitation has already been accepted.')
            } else {
                setError(errorData?.error || 'Invalid invitation link.')
            }
        }

        // Fetch user workspaces if logged in
        if (accessToken) {
            try {
                const meRes = await authService.getProfile()
                const user = meRes.data.user
                setUserEmail(user?.email || '')
                setUserName(user?.first_name || '')

                const wsRes = await workspacesService.getWorkspaces()
                const wsData = wsRes.data
                setUserWorkspaces(
                    Array.isArray(wsData) ? wsData :
                        wsData?.results ? wsData.results :
                            wsData?.workspaces ? wsData.workspaces : []
                )
            } catch {
                // Not authenticated or token expired
            }
        }

        setLoading(false)
    }

    const handleAccept = async () => {
        if (!isLoggedIn) {
            router.push(`/login?invite_token=${token}`)
            return
        }

        setAccepting(true)
        setError('')
        try {
            const response = await authService.acceptWorkspaceInvitation(token)
            const workspaceId = response.data.workspace?.id
            toast.success('Successfully joined workspace!')
            setSuccess('Successfully joined workspace!')
            setTimeout(() => {
                router.push(workspaceId ? `/${workspaceId}/home` : '/home')
            }, 1500)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to accept invitation')
            setAccepting(false)
        }
    }

    const handleReject = () => {
        router.push('/home')
    }

    const handleLogin = () => {
        router.push(`/login?invite_token=${token}`)
    }

    const handleSignup = () => {
        router.push(`/invite?token=${token}`)
    }

    const handleWorkspaceClick = (workspaceId: string) => {
        router.push(`/${workspaceId}/home`)
    }

    if (loading) {
        return (
            <main className="min-h-screen w-full bg-gradient-to-br from-[#cdd9ff] via-[#b7c7ff] to-[#8fa8ff] flex items-center justify-center px-4">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <p className="text-white font-medium">Loading...</p>
                </div>
            </main>
        )
    }

    if (error && !data) {
        return (
            <main className="min-h-screen w-full bg-gradient-to-br from-[#cdd9ff] via-[#b7c7ff] to-[#8fa8ff] flex items-center justify-center px-4">
                <Card className="w-full max-w-[720px] rounded-2xl shadow-xl border-none">
                    <CardContent className="p-8 md:p-12 text-center">
                        <div className="flex justify-center mb-6">
                            <Image src={Images.logo} alt="Logo" width={36} height={36} priority />
                        </div>
                        <h1 className="text-2xl font-semibold text-black mb-3">Invitation Error</h1>
                        <p className="text-sm text-muted-foreground mb-6">{error}</p>
                        <Button onClick={() => router.push('/login')}>Go to Login</Button>
                    </CardContent>
                </Card>
            </main>
        )
    }

    const needsRegistration = data?.registration_required && !isLoggedIn
    const needsLogin = data?.user_exists && !isLoggedIn

    return (
        <main className="min-h-screen w-full bg-gradient-to-br from-[#cdd9ff] via-[#b7c7ff] to-[#8fa8ff] flex items-center justify-center px-4">
            <Card className="w-full max-w-[720px] rounded-2xl shadow-xl border-none">
                <CardContent className="p-8 md:p-12">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <Image
                            src={Images.logo}
                            alt="Logo"
                            width={36}
                            height={36}
                            priority
                        />
                    </div>

                    {/* Header */}
                    <h1 className="text-2xl md:text-3xl font-semibold text-center text-black">
                        Welcome Back 👋
                    </h1>
                    <p className="text-sm text-foreground text-center mt-2">
                        Open an existing workspace
                    </p>

                    {/* Success */}
                    {success && (
                        <div className="mt-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md text-center">
                            {success}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md text-center">
                            {error}
                        </div>
                    )}

                    {/* Workspace list — show user's existing workspaces if logged in */}
                    {isLoggedIn && userWorkspaces.length > 0 && (
                        <div className="mt-8 border rounded-xl overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-3 bg-white">
                                <p className="text-sm font-medium">
                                    {userName || 'Workspaces'} of{' '}
                                    <span className="font-semibold">{userEmail}</span>
                                </p>
                                <button className="text-sm text-primary hover:underline">
                                    See more
                                </button>
                            </div>

                            <Separator />

                            {userWorkspaces.map((ws) => (
                                <div
                                    key={ws.id}
                                    className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition cursor-pointer"
                                    onClick={() => handleWorkspaceClick(ws.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">{ws.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {ws.members && ws.members.length > 0 && (
                                                    <AvatarStack
                                                        avatars={ws.members.map(
                                                            (m) => m.avatar || Images.user.src
                                                        )}
                                                    />
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {ws.member_count
                                                        ? `${ws.member_count} members`
                                                        : 'view all members'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Invitation section */}
                    {data && !success && (
                        <>
                            <h2 className="text-sm font-semibold text-center mt-10">
                                Accept an invitation
                            </h2>

                            <div className="mt-4 border rounded-xl overflow-hidden">
                                <div className="px-5 py-4">
                                    <p className="text-sm mb-4">
                                        <span className="font-medium">
                                            {data.invitation.invited_by}
                                        </span>{' '}
                                        has invited you to join the{' '}
                                        <span className="font-semibold">
                                            {data.workspace.name}
                                        </span>
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    {data.workspace.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-muted-foreground">
                                                        {data.workspace.member_count
                                                            ? `${data.workspace.member_count} members`
                                                            : `Role: ${data.invitation.role}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {needsRegistration ? (
                                            <div className="flex items-center gap-3">
                                                <Button size="sm" onClick={handleSignup}>
                                                    Create Account
                                                </Button>
                                            </div>
                                        ) : needsLogin ? (
                                            <div className="flex items-center gap-3">
                                                <Button size="sm" onClick={handleLogin}>
                                                    Login to Accept
                                                </Button>
                                            </div>
                                        ) : userEmail.toLowerCase() !== data.invitation.email.toLowerCase() ? (
                                            <div className="flex flex-col items-end gap-2">
                                                <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                                                    Logged in as {userEmail}. <br />This invitation is for {data.invitation.email}.
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={async () => {
                                                        await authService.logout();
                                                        router.push(`/login?invite_token=${token}`);
                                                    }}
                                                >
                                                    Switch Account
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    size="sm"
                                                    onClick={handleAccept}
                                                    disabled={accepting}
                                                >
                                                    {accepting ? 'Accepting...' : 'Accept'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-500"
                                                    onClick={handleReject}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </main>
    )
}
