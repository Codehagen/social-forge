import { redirect } from "next/navigation";
import SignInAuth from "@/components/auth/sign-in";
import { constructMetadata } from "@/lib/constructMetadata";
import { getCurrentUser } from "@/app/actions/user";
import { resolveRedirectParam } from "@/lib/auth/redirect";

export const metadata = constructMetadata({
  title: "Sign In - Social Forge",
  description:
    "Sign in to your Social Forge account and continue building websites with AI-powered tools. Manage your client projects and workspaces.",
  noIndex: true,
});

type SignInPageProps = {
  searchParams?: {
    prompt?: string;
    next?: string;
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

    const defaultDestination = params.size
      ? `/dashboard?${params.toString()}`
      : "/dashboard";

    const destination = searchParams?.next
      ? resolveRedirectParam(searchParams.next, defaultDestination)
      : defaultDestination;

    redirect(destination);
  }

  return <SignInAuth />;
}
