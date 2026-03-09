"use client"

import { MoreVertical, Plus, Users, Shield, CheckCircle, UserPlus } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { Images } from "@/public"
import UserAvatar from "@/app/components/ui/UserAvatar";
import { useState, useEffect } from "react";
import InviteMembersModal from "@/app/components/team/modal/InviteMembersModal";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { workspacesService } from "@/libs/api/services";

interface WorkspaceInvitation {
  id: string;
  email: string;
  phone: string | null;
  job_role: string | null;
  role: 'Admin' | 'Member';
  status: 'pending' | 'accepted' | 'declined';
  user_status: 'active' | 'inactive';
  created_at: string;
  expires_at: string;
  invited_by: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  workspace_name: string;
}

interface WorkspaceMember {
  id: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  name: string;
  phone: string | null;
  job_role: string | null;
  role: 'Owner' | 'Admin' | 'Member';
  user_status: 'active' | 'inactive';
  joined_at: string;
  email: string;
}

export default function TeamManagementPage() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchMembers();
      fetchInvitations();
    }
  }, [currentWorkspace?.id]);

  const fetchMembers = async () => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);
      const response = await workspacesService.getMembers(currentWorkspace.id);
      setMembers(response.data.results.data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    if (!currentWorkspace?.id) return;

    try {
      const response = await workspacesService.getInvitations(currentWorkspace.id);
      setInvitations(response.data.results.data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  };

  const getStats = () => {
    const totalMembers = members.length;
    const adminCount = members.filter(m => m.role === 'Admin' || m.role === 'Owner').length;
    const activeCount = members.filter(m => m.user_status === 'active').length;
    const pendingCount = invitations.filter(inv => inv.status === 'pending').length;

    return {
      totalMembers,
      adminCount,
      activeCount,
      pendingCount
    };
  };

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

  const stats = getStats();

  return (
    <div className="p-6 space-y-6 bg-muted min-h-full">
      <InviteMembersModal
        open={open}
        onClose={() => setOpen(false)}
        onInviteSent={() => {
          fetchMembers();
          fetchInvitations();
        }}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team - {currentWorkspace?.name || 'Loading...'}</h1>
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
        <StatCard title="Total Members" value={stats.totalMembers.toString()} subtitle="Complete Team" icon={<Users />} />
        <StatCard title="Admin" value={stats.adminCount.toString()} subtitle="Admin Access" icon={<Shield />} />
        <StatCard title="Available" value={stats.activeCount.toString()} subtitle="Ready to work" icon={<CheckCircle />} />
        <StatCard title="Pending Invite" value={stats.pendingCount.toString()} subtitle="Pending Invitation" icon={<UserPlus />} />
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-card shadow-sm p-4 animate-pulse">
              <div className="h-20 w-20 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              name={`${member.user.first_name} ${member.user.last_name}`}
              role={member.job_role || 'Team Member'}
              access={member.role}
              email={member.user.email}
              phone={member.phone || 'N/A'}
              user={member.user}
              accessVariant={member.role === 'Owner' ? 'owner' : 'member'}
              status={member.user_status}
            />
          ))}
        </div>
      )}
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
  user,
  accessVariant = "member",
  status = "active"
}: {
  name: string;
  role: string;
  access: string;
  email: string;
  phone: string;
  user: any;
  accessVariant?: "member" | "owner";
  status?: "active" | "inactive";
}) {
  return (
    <div className="rounded-2xl bg-card shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <UserAvatar user={user} size={80} className="w-20 h-20 rounded-xl" />
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="pt-4">
          <p className="font-medium text-foreground">{name}</p>
          <StatusPill status={status === 'active' ? 'Available' : 'Inactive'} />
        </div>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>{email}</p>
          <p>{phone}</p>
        </div>
      </div>

      <div className="border-t p-4 text-sm space-y-3">
        <p className="text-muted-foreground">POSITION</p>
        <p className="font-medium text-foreground">{role}</p>
        <p className="text-muted-foreground">ACCESS TYPE</p>
        <span
          className={
            accessVariant === "owner"
              ? "inline-flex rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive border border-destructive"
              : "inline-flex rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400"
          }
        >
          {access}
        </span>
      </div>
    </div>
  );
}
