"use client"

import { MoreVertical, Plus, Users, Shield, CheckCircle, UserPlus, Edit2, Trash2 } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { Images } from "@/public"
import UserAvatar from "@/app/components/ui/UserAvatar";
import { useState, useEffect } from "react";
import InviteMembersModal from "@/app/components/team/modal/InviteMembersModal";
import EditMemberModal from "@/app/components/team/modal/EditMemberModal";
import DeleteMemberModal from "@/app/components/team/modal/DeleteMemberModal";
import ImagePreviewModal from "@/app/components/ui/ImagePreviewModal";
import { useWorkspace } from "@/libs/hooks/useWorkspace";
import { workspacesService } from "@/libs/api/services";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const isRouteActive = pathname.includes('/team');
  const { currentWorkspace } = useWorkspace();

  // Image Preview State
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: membersRes, isLoading: loadingMembers, refetch: refetchMembers } = useQuery({
    queryKey: ['workspaceMembers', currentWorkspace?.id],
    queryFn: async () => {
      const wsId = currentWorkspace?.id;
      if (!wsId) return null;
      return workspacesService.getMembers(wsId);
    },
    enabled: !!currentWorkspace?.id && isRouteActive,
    staleTime: 5 * 60 * 1000,
  });

  const { data: invitationsRes, refetch: refetchInvitations } = useQuery({
    queryKey: ['workspaceInvitations', currentWorkspace?.id],
    queryFn: async () => {
      const wsId = currentWorkspace?.id;
      if (!wsId) return null;
      return workspacesService.getInvitations(wsId);
    },
    enabled: !!currentWorkspace?.id && isRouteActive,
    staleTime: 5 * 60 * 1000,
  });

  const members: WorkspaceMember[] = (membersRes as any)?.data?.results?.data || [];
  const invitations: WorkspaceInvitation[] = (invitationsRes as any)?.data?.results?.data || [];
  const loading = loadingMembers;


  // Removed fetchMembers and fetchInvitations as they are now handled by useQuery


  const getStats = () => {
    const totalMembers = members.length;
    const adminCount = members.filter((m: WorkspaceMember) => m.role === 'Admin' || m.role === 'Owner').length;
    const activeCount = members.filter((m: WorkspaceMember) => m.user_status === 'active').length;
    const pendingCount = invitations.filter((inv: WorkspaceInvitation) => inv.status === 'pending').length;

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
          refetchMembers();
          refetchInvitations();
        }}
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        {/* Left Section */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground truncate">
            Team - {currentWorkspace?.name || "Loading..."}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your team members and their assignments
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-start sm:justify-end">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-3 sm:px-4 py-2 text-sm font-medium text-primary-foreground shadow w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Invite
            <span className="hidden md:flex">Member</span>
          </button>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={stats.totalMembers.toString()}
          subtitle="Complete Team"
          icon={<Users />}
        />
        <StatCard
          title="Admin"
          value={stats.adminCount.toString()}
          subtitle="Admin Access"
          icon={<Shield />}
        />
        <StatCard
          title="Available"
          value={stats.activeCount.toString()}
          subtitle="Ready to work"
          icon={<CheckCircle />}
        />
        <StatCard
          title="Pending Invite"
          value={stats.pendingCount.toString()}
          subtitle="Pending Invitation"
          icon={<UserPlus />}
        />
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-card shadow-sm p-4 animate-pulse"
            >
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
          {members.map((member: WorkspaceMember) => (
            <MemberCard
              key={member.id}
              id={member.id}
              userId={member.user.id}
              name={`${member.user.first_name} ${member.user.last_name}`}
              role={member.job_role || "Team Member"}
              access={member.role}
              email={member.user.email}
              phone={member.phone || "N/A"}
              user={{
                name: member.name || `${member.user.first_name} ${member.user.last_name}`.trim(),
                first_name: member.user.first_name,
                last_name: member.user.last_name,
                email: member.user.email,
                avatar: member.user.avatar,
              }}
              accessVariant={member.role === "Owner" ? "owner" : "member"}
              status={member.user_status}
              onSaved={refetchMembers}
              onDeleted={refetchMembers}
              onPreview={(url, name) => setPreviewImage({ url, name })}
            />
          ))}
        </div>
      )}

      <ImagePreviewModal
        isOpen={!!previewImage}
        imageUrl={previewImage?.url || ''}
        fileName={previewImage?.name}
        isCircular={true}
        onClose={() => setPreviewImage(null)}
        onDownload={previewImage ? () => {
          const link = document.createElement('a');
          link.href = previewImage.url;
          link.download = previewImage.name || 'avatar';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } : undefined}
      />
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
  id,
  userId,
  name,
  role,
  access,
  email,
  phone,
  user,
  accessVariant = "member",
  status = "active",
  onSaved,
  onDeleted,
  onPreview,
}: {
  id?: string;
  userId?: string;
  name: string;
  role: string;
  access: string;
  email: string;
  phone: string;
  user: any;
  accessVariant?: "member" | "owner";
  status?: "active" | "inactive";
  onSaved?: () => void;
  onDeleted?: () => void;
  onPreview?: (url: string, name: string) => void;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Helper to get raw avatar URL if it exists
  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    const imageSrc = user.avatar;
    if (typeof imageSrc === 'string' && imageSrc.startsWith('/media/')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://api.buildtrackerapp.com';
      return `${baseUrl}${imageSrc}`;
    }
    return imageSrc as string;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <>
      <EditMemberModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={{ id: userId, name, email, role, access, phone }}
        onSaved={() => {
          setIsEditModalOpen(false);
          onSaved?.();
        }}
      />
      <DeleteMemberModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        member={{ id: userId, email }}
        onDeleted={() => {
          setIsDeleteModalOpen(false);
          onDeleted?.();
        }}
      />
      <div className="rounded-2xl bg-card shadow-sm">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <UserAvatar
              user={user}
              size={80}
              className="w-20 h-20 rounded-xl"
              onClick={avatarUrl ? () => onPreview?.(avatarUrl, name) : undefined}
            />
            <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="rounded-full p-1.5 hover:bg-muted/80 transition-colors focus:outline-none"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-1 w-48 rounded-xl border bg-popover shadow-lg p-2 flex flex-col gap-1">
                    <button
                      onClick={() => { setMenuOpen(false); setIsEditModalOpen(true); }}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg w-full text-left transition-colors text-foreground"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" /> Edit
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setIsDeleteModalOpen(true); }}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg w-full text-left transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600/80 dark:text-red-400/80" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
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
    </>
  );
}
