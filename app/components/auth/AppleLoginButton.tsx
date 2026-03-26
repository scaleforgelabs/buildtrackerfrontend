"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/libs/api/auth";
import { Button } from "@/app/components/ui/button";
import { toast } from "sonner";
import { Images } from "@/public";
import Image from "next/image";

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: any) => void;
        signIn: () => Promise<any>;
      };
    };
  }
}

interface AppleLoginButtonProps {
  label?: string;
  onError?: (error: string) => void;
}

const APPLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "com.buildtrackerapp.web";

import { useAuth } from "@/libs/hooks/useAuth";

export default function AppleLoginButton({
  label = "Continue with Apple",
  onError,
}: AppleLoginButtonProps) {
  const router = useRouter();
  const { appleLogin } = useAuth();
  const searchParams = useSearchParams();
  const inviteToken =
    searchParams.get("invite_token") || searchParams.get("token") || "";
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    const scriptId = "apple-login-script";
    if (document.getElementById(scriptId)) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => {
      console.log("Apple SDK Script loaded");
      setScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Apple SDK");
      onError?.("Failed to load Apple SDK");
    };
    document.head.appendChild(script);
  }, [onError]);

  useEffect(() => {
    if (!scriptLoaded || !window.AppleID || initialized) return;

    try {
      console.log("Initializing Apple ID with Client ID:", APPLE_CLIENT_ID);
      window.AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: "name email",
        redirectURI: window.location.origin + "/login",
        usePopup: true,
      });
      setInitialized(true);
      console.log("Apple ID initialized successfully");
    } catch (err) {
      console.error("Apple ID initialization failed:", err);
    }
  }, [scriptLoaded, initialized]);

  const handleAppleLogin = async () => {
    if (!initialized || !window.AppleID) {
      console.warn("Apple Sign-In is not initialized, attempting init now...");
      if (window.AppleID) {
        window.AppleID.auth.init({
          clientId: APPLE_CLIENT_ID,
          scope: "name email",
          redirectURI: window.location.origin + "/login",
          usePopup: true,
        });
        setInitialized(true);
      } else {
        onError?.("Apple Sign-In SDK not loaded yet. Please wait a moment.");
        return;
      }
    }

    setLoading(true);
    try {
      const data = await window.AppleID.auth.signIn();
      const id_token = data.authorization.id_token;

      const result = await appleLogin(id_token);
      const { user } = result;

      // Handle pending invitation if any
      if (inviteToken) {
        try {
          const loggedInEmail = user.email;

          const inviteRes = await authService.getInvitationDetails(inviteToken);
          const invitedEmail = inviteRes.data.invitation.email;

          if (loggedInEmail.toLowerCase() === invitedEmail.toLowerCase()) {
            const response =
              await authService.acceptWorkspaceInvitation(inviteToken);
            const workspaceId = response.data.workspace?.id;
            if (workspaceId) {
              toast.success(
                `Successfully joined ${response.data.workspace.name}!`,
              );
              router.push(`/${workspaceId}/home`);
              return;
            }
          } else {
            toast.warning(
              `Invitation skipped. It was sent to ${invitedEmail}, but you logged in as ${loggedInEmail}.`,
            );
          }
        } catch (inviteErr) {
          console.error(
            "Failed to auto-accept invitation after Apple login:",
            inviteErr,
          );
        }
      }

      // Redirect based on workspace persistence
      if (user.last_active_workspace) {
        router.push(`/${user.last_active_workspace}/home`);
      } else {
        router.push("/home");
      }
    } catch (error: any) {
      console.error("Apple login error:", error);
      if (error.error !== "user_cancelled") {
        onError?.(error instanceof Error ? error.message : "Apple login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full gap-2 font-normal text-muted-foreground hover:text-foreground"
      onClick={handleAppleLogin}
      disabled={loading}
    >
      <Image
        src={Images.apple}
        alt="Apple Logo"
        width={16}
        height={16}
        className="h-7 w-7"
      />
      {loading ? "Connecting..." : label}
    </Button>
  );
}
