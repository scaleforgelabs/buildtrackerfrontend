"use client";

import Image from "next/image";
import { Card, CardContent } from "../components/ui/card";
import { Building2 } from "lucide-react";
import { AvatarStack } from "../components/ui/avatar-stack";
import { Separator } from "@radix-ui/react-select";
import { Button } from "../components/ui/button";
import { Images } from "@/public";

const workspaces = [
    {
        id: 1,
        name: "Nextatge’s Workspace",
        members: 6,
        avatars: [
            Images.user.src,
            Images.user.src,
            Images.user.src,
            Images.user.src,
            Images.user.src,
        ],
    },
    {
        id: 2,
        name: "Buildtracker Dev Team’s Workspace",
        members: 8,
        avatars: [
            Images.user.src,
            Images.user.src,
            Images.user.src,
            Images.user.src,
            Images.user.src,
        ],
    },
];

const invitations = [
    {
        id: 1,
        inviter: "Muaz Balogun",
        workspace: "Think Forward Workspace",
        members: 5,
        avatars: [
            Images.user.src,
            Images.user.src,
            Images.user.src,
            Images.user.src,
        ],
    },
];

export default function WorkspacesPage() {
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

                    {/* Workspace list */}
                    <div className="mt-8 border rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 bg-white">
                            <p className="text-sm font-medium">
                                Abdullah of{" "}
                                <span className="font-semibold">asosiluo@gmail.com</span>
                            </p>
                            <button className="text-sm text-primary hover:underline">
                                See more
                            </button>
                        </div>

                        <Separator />

                        {workspaces.map((ws) => (
                            <div
                                key={ws.id}
                                className="flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium">{ws.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <AvatarStack avatars={ws.avatars} />
                                            <span className="text-xs text-muted-foreground">
                                                view all members
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Invitation */}
                    <h2 className="text-sm font-semibold text-center mt-10">
                        Accept an invitation
                    </h2>

                    <div className="mt-4 border rounded-xl overflow-hidden">
                        {invitations.map((inv) => (
                            <div key={inv.id} className="px-5 py-4">
                                <p className="text-sm mb-4">
                                    <span className="font-medium">{inv.inviter}</span> has invited
                                    you to join the{" "}
                                    <span className="font-semibold">{inv.workspace}</span>
                                </p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">
                                                Nextatge’s Workspace
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <AvatarStack avatars={inv.avatars} />
                                                <span className="text-xs text-muted-foreground">
                                                    {inv.members} members
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button size="sm">Accept</Button>
                                        <Button size="sm" variant="outline" className="text-red-500">
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
