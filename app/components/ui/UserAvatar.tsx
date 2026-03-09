import React from 'react';
import Image, { StaticImageData } from 'next/image';

interface UserAvatarProps {
    user?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        avatar?: string | StaticImageData;
        name?: string; // Fallback if separate names aren't available
    } | null;
    className?: string;
    size?: number;
}

export default function UserAvatar({ user, className = "", size = 40 }: UserAvatarProps) {
    // 1. Try to get the image
    let imageSrc = user?.avatar;
    if (typeof imageSrc === 'string' && imageSrc.startsWith('/media/')) {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://187.124.112.241';
        imageSrc = `${baseUrl}${imageSrc}`;
    } else if (typeof imageSrc === 'string' && imageSrc.startsWith('http')) {
        // If it's already an absolute URL (like from Social Auth or our absolute URI builder), use it directly.
        imageSrc = imageSrc;
    }

    // 2. Logic for initials
    const getInitials = () => {
        if (!user) return "U";

        if (user.first_name && user.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }

        const name = user.name || user.email || "User";
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    if (imageSrc) {
        return (
            <div className={`relative rounded-full overflow-hidden border border-border flex-shrink-0 ${className}`} style={{ width: size, height: size }}>
                <Image
                    src={imageSrc}
                    alt="User avatar"
                    fill
                    className="object-cover"
                />
            </div>
        );
    }

    return (
        <div
            className={`relative rounded-full overflow-hidden border border-border flex-shrink-0 flex items-center justify-center bg-primary/10 text-primary font-medium ${className}`}
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {getInitials()}
        </div>
    );
}
