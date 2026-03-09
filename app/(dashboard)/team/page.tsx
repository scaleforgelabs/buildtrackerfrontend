"use client"

import { MoreVertical, Plus, Users, Shield, CheckCircle, UserPlus } from "lucide-react";
import Image from "next/image";
import { Images } from "@/public"
import { useState, useEffect } from "react";
import InviteMembersModal from "@/app/components/team/modal/InviteMembersModal";

export default function TeamManagementPage() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-6 space-y-6 bg-muted min-h-full">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-muted min-h-full">
      <InviteMembersModal open={open} onClose={() => setOpen(false)} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your team members and their assignments
          </p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow">
          <Plus className="h-4 w-4" />
          Invite <span className="hidden md:flex">
            Member
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Members" value="3" subtitle="Complete Team" icon={<Users />} />
        <StatCard title="Admin" value="1" subtitle="Admin Access" icon={<Shield />} />
        <StatCard title="Available" value="3" subtitle="Ready to work" icon={<CheckCircle />} />
        <StatCard title="Pending Invite" value="0" subtitle="Pending Invitation" icon={<UserPlus />} />
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MemberCard
          name="Muaz Balogun"
          role="CEO/CTO"
          access="Owner"
          email="muazbalogun97@gmail.com"
          phone="+234555890457"
          avatar="https://i.pravatar.cc/150?img=32"
          accessVariant="owner"
        />
        <MemberCard
          name="Abdullah Saliu"
          role="Product Designer"
          access="Member"
          email="aosoliu10@gmail.com"
          phone="+234555890457"
          avatar="https://i.pravatar.cc/150?img=12"
        />
        <MemberCard
          name="Abdulhameed Alli‑Shittu"
          role="Software Engineer (Frontend)"
          access="Member"
          email="aosoliu10@gmail.com"
          phone="+234555890457"
          avatar="https://i.pravatar.cc/150?img=24"
        />
        <MemberCard
          name="Abdulhameed Alli‑Shittu"
          role="Software Engineer (Backend)"
          access="Member"
          email="aosoliu10@gmail.com"
          phone="+234555890457"
          avatar="https://i.pravatar.cc/150?img=15"
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-background">
          {icon}
        </div>
      </div>
      <div className=" text-3xl font-semibold">{value}</div>
      <p className=" text-sm text-primary">{subtitle}</p>
    </div>
  );
}

const StatusPill = ({ status }: { status: string }) => {
  return (
    <span className="inline-flex rounded-lg border border-green-600/20 bg-green-500/10 px-2 py-1.5 text-xs text-green-700 dark:text-green-400">
      {status}
    </span>
  )
}

function MemberCard({
  name,
  role,
  access,
  email,
  phone,
  avatar,
  accessVariant = "member",
}: {
  name: string;
  role: string;
  access: string;
  email: string;
  phone: string;
  avatar: string;
  accessVariant?: "member" | "owner";
}) {
  return (
    <div className="rounded-2xl bg-card shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div
            className="relative overflow-hidden rounded-xl h-20 w-20 "
          >
            <Image
              src={Images.user}
              alt="profile.pic"
              fill
              className="object-cover"
            />
          </div>

          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="pt-4">
          <p className="font-medium text-foreground">{name}</p>
          <StatusPill status="Available" />
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>{email}</p>
          <p>{phone}</p>
        </div>
      </div>

      <div className="border-t p-4 text-sm space-y-3">
        <p className="text-muted-foreground">POSITION</p>
        <p className="font-medium text-foreground">{role}</p>
        <p className=" text-muted-foreground">ACCESS TYPE</p>
        <span
          className={
            accessVariant === "owner"
              ? "inline-flex rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive border border-destructive"
              : "inline-flex rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-600  dark:text-orange-400"
          }
        >
          {access}
        </span>
      </div>
    </div>
  );
}
