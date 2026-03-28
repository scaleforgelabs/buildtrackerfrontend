'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/libs/hooks/useAuth'

export default function AuthRedirect() {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && isAuthenticated) {
            router.replace('/')
        }
    }, [isAuthenticated, loading, router])

    return null
}
