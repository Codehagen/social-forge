import SignInAuth from "@/components/auth/sign-in";
import { constructMetadata } from "@/lib/constructMetadata";

export const metadata = constructMetadata({
  title: "Sign In - Social Forge",
  description:
    "Sign in to your Social Forge account and continue building websites with AI-powered tools. Manage your client projects and workspaces.",
});

export default function SignIn() {
  return <SignInAuth />;
}
