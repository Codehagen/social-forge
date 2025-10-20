"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "@/lib/auth-client";

interface UserInfo {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface UserProps {
  user?: UserInfo | null;
  authProvider?: string | null;
}

export function User({ user: serverUser }: UserProps) {
  const session = useSession();
  const clientUser = session?.data?.user as UserInfo | undefined;

  const user = clientUser ?? serverUser ?? null;

  const initials = useMemo(() => {
    if (!user) return "";
    if (user.name) {
      const letters = user.name
        .trim()
        .split(/\s+/)
        .map((segment) => segment[0]?.toUpperCase())
        .filter(Boolean)
        .join("");
      if (letters.length > 0) return letters.slice(0, 2);
    }
    if (user.email) {
      return user.email[0]?.toUpperCase() ?? "U";
    }
    return "U";
  }, [user]);

  if (user) {
    const label = user.name ?? user.email ?? "Account";

    const handleSignOut = async () => {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/";
          },
        },
      });
    };

    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image ?? undefined} alt={label} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button asChild variant="outline" size="sm">
      <Link href="/sign-in">Sign in</Link>
    </Button>
  );
}
