'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Images } from '@/public'
import Image from 'next/image'
import { register } from '@/libs/api/auth'
import GoogleLoginButton from '@/app/components/auth/GoogleLoginButton'
import AppleLoginButton from '@/app/components/auth/AppleLoginButton'

const SignupPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const [first_name, ...lastNameParts] = formData.fullName.split(' ')
            const last_name = lastNameParts.join(' ')

            await register({
                email: formData.email,
                password: formData.password,
                first_name,
                last_name
            })
            router.push(`/otp-verification?email=${encodeURIComponent(formData.email)}`)
        } catch (err: any) {
            setError(err.message || 'Registration failed')
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
                <h1 className="mb-2 text-3xl font-bold text-foreground">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                    Join thousands of teams managing their build pipelines with ease. Start your free trial today and experience the difference.
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
                    />
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
                    {loading ? 'Creating account...' : 'Sign up'}
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
                    label="Sign up with Google"
                    onError={(err) => setError(err)}
                />
                <AppleLoginButton
                    label="Sign up with Apple"
                    onError={(err) => setError(err)}
                />
            </div>

            <div className="mt-6 text-left text-sm font-medium text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
            </div>
        </div>
    )
}

export default SignupPage