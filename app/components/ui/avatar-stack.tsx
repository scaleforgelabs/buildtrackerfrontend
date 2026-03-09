"use client";

import { cn } from "@/libs/utils";
import UserAvatar from "./UserAvatar";

interface AvatarStackProps {
    // Deprecated: use users instead
    avatars?: string[];
    users?: { name?: string; avatar?: string }[];
    size?: "sm" | "md";
    max?: number;
    className?: string;
}

export function AvatarStack({
    users,
    avatars, // Keep for backward compatibility if needed, but prefer users
    size = "sm",
    max = 5,
    className,
}: {
    users?: { name?: string; avatar?: string }[];
    avatars?: string[];
    size?: "sm" | "md";
    max?: number;
    className?: string;
}) {
    const items = users || avatars?.map(src => ({ avatar: src })) || [];
    const visibleItems = items.slice(0, max);
    const remaining = items.length - max;

    const sizePx = size === "sm" ? 24 : 32;

    return (
        <div className={cn("flex -space-x-2", className)}>
            {visibleItems.map((user, index) => (
                <UserAvatar
                    key={index}
                    user={user}
                    size={sizePx}
                    className={cn(
                        "border border-background ring-2 ring-background",
                        size === "sm" ? "w-6 h-6" : "w-8 h-8"
                    )}
                />
            ))}

            {remaining > 0 && (
                <div
                    className={cn(
                        size === "sm" ? "h-6 w-6" : "h-8 w-8",
                        "flex items-center justify-center rounded-full border border-background bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background"
                    )}
                >
                    +{remaining}
                </div>
            )}
        </div>
    );
}
