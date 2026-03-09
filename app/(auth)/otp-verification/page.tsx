'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/app/components/ui/button"
import Image from 'next/image'
import { Images } from '@/public'
import { OtpInput } from '@/app/components/ui/OtpInput'
import { authService } from '@/libs/api/auth'
import { toast } from 'sonner'

const OtpVerificationPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || ''
    const inviteToken = searchParams.get('invite_token') || ''

    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [resending, setResending] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [countdown, setCountdown] = useState(0)

    useEffect(() => {
        if (!email) {
            router.push('/signup')
        }
    }, [email, router])

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    const handleVerify = async () => {
        if (otp.length !== 4) {
            setError('Please enter the full 4-digit code')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await authService.verifyOtp(email, otp)
            const { token, refresh_token, workspace_joined } = response.data

            localStorage.setItem('access_token', token)
            localStorage.setItem('refresh_token', refresh_token)

            if (workspace_joined) {
                toast.success(`Verified! Joining ${workspace_joined.name}...`)
                setSuccess(`Email verified! Joining ${workspace_joined.name}...`)
                setTimeout(() => router.push(`/${workspace_joined.id}/home`), 1500)
            } else if (inviteToken) {
                // Fallback: try to accept invitation manually
                setSuccess('Email verified! Accepting invitation...')
                try {
                    // Verify email matches invitation before accepting
                    const inviteRes = await authService.getInvitationDetails(inviteToken)
                    const invitedEmail = inviteRes.data.invitation.email

                    if (invitedEmail.toLowerCase() === email.toLowerCase()) {
                        const inviteResponse = await authService.acceptWorkspaceInvitation(inviteToken)
                        const workspaceId = inviteResponse.data.workspace?.id
                        toast.success(`Successfully joined ${inviteResponse.data.workspace.name}!`)
                        setTimeout(() => router.push(workspaceId ? `/${workspaceId}/home` : '/home'), 1500)
                    } else {
                        console.warn('Invitation email mismatch in fallback, skipping auto-accept')
                        setTimeout(() => router.push('/home'), 1500)
                    }
                } catch {
                    setTimeout(() => router.push('/home'), 1500)
                }
            } else {
                setSuccess('Email verified successfully! Redirecting...')
                setTimeout(() => router.push('/home'), 1500)
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Verification failed')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResending(true)
        setError('')
        setSuccess('')

        try {
            await authService.resendOtp(email)
            setSuccess('New OTP sent! Check your email.')
            setCountdown(60)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to resend OTP')
        } finally {
            setResending(false)
        }
    }

    if (!email) return null

    return (
        <div className="mx-auto w-full max-w-md">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-6 flex h-10 w-10 items-center justify-center">
                    <Image src={Images.logo} alt="" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-foreground">OTP Verification</h1>
                <p className="text-sm text-muted-foreground">
                    Enter the verification code we just sent to <strong>{email}</strong>
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                    {success}
                </div>
            )}

            {/* OTP Inputs */}
            <OtpInput
                length={4}
                onComplete={(code) => setOtp(code)}
            />
            <Button
                className="w-full text-base"
                size="lg"
                onClick={handleVerify}
                disabled={loading || otp.length !== 4}
            >
                {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="mt-6 text-sm font-medium text-muted-foreground">
                Didn&apos;t get code yet?{' '}
                {countdown > 0 ? (
                    <span className="text-muted-foreground">Resend in {countdown}s</span>
                ) : (
                    <button
                        className="text-primary hover:underline disabled:opacity-50"
                        onClick={handleResend}
                        disabled={resending}
                    >
                        {resending ? 'Sending...' : 'Resend'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default OtpVerificationPage
