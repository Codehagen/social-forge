import { redirect } from "next/navigation";
import SignUpAuth from "@/components/auth/sign-up";
import { constructMetadata } from "@/lib/constructMetadata";
import { getCurrentUser } from "@/app/actions/user";
import { resolveRedirectParam } from "@/lib/auth/redirect";

export const metadata = constructMetadata({
  title: "Sign Up - Social Forge",
  description:
    "Create your Social Forge account and start building stunning websites with AI. Perfect for agencies managing multiple clients.",
});

type SignUpPageProps = {
  searchParams?: {
    prompt?: string;
    next?: string;
  };
};

export default async function SignUp({ searchParams }: SignUpPageProps) {
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

  return <SignUpAuth />;
}
