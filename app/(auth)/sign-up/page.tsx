import SignUpAuth from "@/components/auth/sign-up";
import { constructMetadata } from "@/lib/constructMetadata";

export const metadata = constructMetadata({
  title: "Sign Up - Social Forge",
  description:
    "Create your Social Forge account and start building stunning websites with AI. Perfect for agencies managing multiple clients.",
});

export default function SignUp() {
  return <SignUpAuth />;
}
