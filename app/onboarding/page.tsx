import { getCurrentUser } from "@/app/actions/user";
import { getCurrentWorkspace } from "@/app/actions/workspace";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import prisma from "@/lib/prisma";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user already has a workspace
  const currentWorkspace = await getCurrentWorkspace();
  if (currentWorkspace) {
    // Mark onboarding as complete for existing users to prevent redirect loop
    if (!user.onboardingCompleted) {
      await prisma.user.update({
        where: { id: user.id },
        data: { onboardingCompleted: true },
      });
    }
    redirect("/dashboard");
  }

  return (
    <OnboardingFlow
      userName={user.name}
      userEmail={user.email}
    />
  );
}
