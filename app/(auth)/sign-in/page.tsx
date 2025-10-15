import { redirect } from "next/navigation";
import SignInAuth from "@/components/auth/sign-in";
import { constructMetadata } from "@/lib/constructMetadata";
import { getCurrentUser } from "@/app/actions/user";

export const metadata = constructMetadata({
  title: "Sign In - Social Forge",
  description:
    "Sign in to your Social Forge account and continue building websites with AI-powered tools. Manage your client projects and workspaces.",
});

type SignInPageProps = {
  searchParams?: {
    prompt?: string;
  };
};

export default async function SignIn({ searchParams }: SignInPageProps) {
  const user = await getCurrentUser();

  if (user) {
    const params = new URLSearchParams();
    const prompt = searchParams?.prompt;

    if (prompt) {
      params.set("prompt", prompt);
    }

    const destination = params.size
      ? `/dashboard?${params.toString()}`
      : "/dashboard";

    redirect(destination);
  }

  return <SignInAuth />;
}
