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
    if (typeof imageSrc === 'string') {
        if (imageSrc.startsWith('/media/')) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.buildtrackerapp.com';
            imageSrc = `${baseUrl}${imageSrc}`;
        }
        // If it starts with http, blob:, or data:, it's already an absolute URL
        else if (imageSrc.startsWith('http') || imageSrc.startsWith('blob:') || imageSrc.startsWith('data:')) {
            imageSrc = imageSrc;
        }
    }

    // 2. Logic for initials
    const getInitials = () => {
        if (!user) return "U";

        // Try to construct a full name from available fields
        const firstName = user.first_name || "";
        const lastName = user.last_name || "";
        const fullName = user.name || (firstName || lastName ? `${firstName} ${lastName}`.trim() : "");

        const nameToUse = fullName || user.email || "User";
        const parts = nameToUse.split(' ').filter(p => !!p);

        // 1. Check for CamelCase in the FIRST word (e.g., "AbdulHameed" -> "AH")
        // We do this first because it's a specific brand requirement
        const firstWord = parts[0] || "";
        const capitals = firstWord.match(/[A-Z]/g);
        if (capitals && capitals.length >= 2) {
            return (capitals[0] + capitals[1]).toUpperCase();
        }

        // 2. If we have at least two parts (regular name like "John Smith" -> "JS")
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }

        // 3. Fallback to start of the name
        return nameToUse.slice(0, 2).toUpperCase();
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
