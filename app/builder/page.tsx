import { cookies } from "next/headers";
import { constructMetadata } from "@/lib/constructMetadata";
import { getServerSession } from "@/lib/coding-agent/session";
import { BuilderHomeContent } from "@/components/builder/home-page-content";

export const metadata = constructMetadata({
  title: "Builder - Social Forge",
  description: "AI Website Builder interface for Social Forge.",
  noIndex: true,
});

export default async function BuilderPage() {
  const cookieStore = await cookies();
  const session = await getServerSession();

  const installDependencies = cookieStore.get("install-dependencies")?.value === "true";
  const keepAlive = cookieStore.get("keep-alive")?.value === "true";
  const maxDurationCookie = cookieStore.get("max-duration")?.value;
  const initialSelectedOwner = cookieStore.get("selected-owner")?.value ?? "";
  const initialSelectedRepo = cookieStore.get("selected-repo")?.value ?? "";

  const defaultMaxDuration = Number.parseInt(process.env.MAX_SANDBOX_DURATION ?? "300", 10);
  const initialMaxDuration = maxDurationCookie ? Number.parseInt(maxDurationCookie, 10) || defaultMaxDuration : defaultMaxDuration;

  const user = session?.user
    ? {
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
      }
    : null;

  const authProvider = (session as { lastLoginMethod?: string | null } | null)?.lastLoginMethod ?? null;

  return (
    <BuilderHomeContent
      user={user}
      authProvider={authProvider}
      initialInstallDependencies={installDependencies}
      initialKeepAlive={keepAlive}
      initialMaxDuration={initialMaxDuration}
      maxSandboxDuration={defaultMaxDuration}
      initialSelectedOwner={initialSelectedOwner}
      initialSelectedRepo={initialSelectedRepo}
    />
  );
}
