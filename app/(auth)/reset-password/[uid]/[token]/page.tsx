'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Images } from '@/public'
import Image from 'next/image'
import { authService } from '@/libs/api/auth'
import Link from 'next/link'

const ResetPasswordPage = () => {
    const params = useParams()
    const router = useRouter()
    const { uid, token } = params

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        setError('')

        try {
            await authService.resetPassword(uid as string, token as string, password)
            setSuccess(true)
            // Redirect after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid or expired reset link.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="mx-auto w-full max-w-2xl text-center">
                <div className="mb-8">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="mb-2 text-3xl font-bold text-foreground">Password Reset Successful</h1>
                    <p className="text-sm text-muted-foreground">
                        Your password has been reset successfully. Redirecting you to login...
                    </p>
                </div>
                <div className="mt-8">
                    <Link href="/login" className="text-primary hover:underline font-medium">Click here if not redirected</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <div className="mb-6 flex h-10 w-10 items-center justify-center">
                    <Image src={Images.logo} alt="" />
                </div>
                <h1 className="mb-2 text-3xl font-bold text-foreground">Create New Password</h1>
                <p className="text-sm text-muted-foreground">
                    Your new password must be unique from those previously used.
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground">New Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-foreground">Confirm New Password</label>
                    <Input
                        type="password"
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <Button
                    type="submit"
                    className="mt-2 w-full text-base"
                    size="lg"
                    disabled={loading}
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
            </form>
        </div>
    )
}

export default ResetPasswordPage
