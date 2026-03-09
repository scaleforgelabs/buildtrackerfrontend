'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Images } from '@/public'
import Image from 'next/image'
import { authService } from '@/libs/api/auth'

const Page = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await authService.forgotPassword(email)
            setSuccess(true)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.')
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
                    <h1 className="mb-2 text-3xl font-bold text-foreground">Check your email</h1>
                    <p className="text-sm text-muted-foreground">
                        We have sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
                    </p>
                </div>
                <div className="mt-8">
                    <Link href="/login" className="text-primary hover:underline font-medium">Return to Sign in</Link>
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
                <h1 className="mb-2 text-3xl font-bold text-foreground">Forgot Password ?</h1>
                <p className="text-sm text-muted-foreground">
                    Don't worry! It occurs. Please enter the email address connected with your account.
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
                    <label className="text-sm font-semibold text-foreground">Your email</label>
                    <Input
                        type="email"
                        placeholder="aoson@theasbuild.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <Button
                    type="submit"
                    className="mt-2 w-full text-base"
                    size="lg"
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
            </form>

            <div className="mt-6 text-left text-sm font-medium text-muted-foreground">
                Remembered Password? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
            </div>
        </div>
    )
}

export default Page
