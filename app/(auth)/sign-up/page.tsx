import { redirect } from "next/navigation";
import SignUpAuth from "@/components/auth/sign-up";
import { constructMetadata } from "@/lib/constructMetadata";
import { getCurrentUser } from "@/app/actions/user";

export const metadata = constructMetadata({
  title: "Sign Up - Social Forge",
  description:
    "Create your Social Forge account and start building stunning websites with AI. Perfect for agencies managing multiple clients.",
});

type SignUpPageProps = {
  searchParams?: {
    prompt?: string;
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

    const destination = params.size
      ? `/dashboard?${params.toString()}`
      : "/dashboard";

    redirect(destination);
  }

  return <SignUpAuth />;
}
