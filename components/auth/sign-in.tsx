"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMemo, useState } from "react";
import { authClient, signIn } from "@/lib/auth-client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { IconInnerShadowTop } from "@tabler/icons-react";
import { buttonVariants } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { resolveRedirectParam } from "@/lib/auth/redirect";

function formatLoginMethod(method: string | null) {
  if (!method) {
    return null;
  }

  if (method === "email") {
    return "Email";
  }

  return method
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default function SignInAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptParam = searchParams.get("prompt")?.trim() ?? "";
  const nextParamRaw = searchParams.get("next");
  const queryParams = new URLSearchParams();
  if (promptParam) {
    queryParams.set("prompt", promptParam);
  }
  if (nextParamRaw) {
    queryParams.set("next", nextParamRaw);
  }
  const querySuffix = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const promptQuery = promptParam
    ? `?prompt=${encodeURIComponent(promptParam)}`
    : "";
  const fallbackDestination = `/dashboard${promptQuery}`;
  const redirectDestination = resolveRedirectParam(nextParamRaw, fallbackDestination);
  const lastMethod = useMemo(
    () => authClient.getLastUsedLoginMethod(),
    []
  );
  const formattedMethod = formatLoginMethod(lastMethod);
  const hasLastMethod = Boolean(lastMethod);
  const emailIsLast = lastMethod === "email";
  const googleIsLast = lastMethod === "google";
  const emailVariant = (emailIsLast || !hasLastMethod) ? "default" : "outline";
  const googleVariant = googleIsLast ? "default" : "outline";

  return (
    <>
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <Link
          href={`/sign-up${querySuffix}`}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "absolute right-4 top-4 md:right-8 md:top-8"
          )}
        >
          Sign Up
        </Link>
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <IconInnerShadowTop className="mr-2 h-6 w-6" />
            Social Forge
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;Social Forge helped us scale from 3 to 25 client websites in just two months.
              </p>
              <footer className="text-sm">
                — Sarah Mitchell, Digital Solutions Agency
              </footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email below to sign in
              </p>
              {formattedMethod && (
                <p className="text-xs text-muted-foreground" aria-live="polite">
                  Last signed in with {formattedMethod}.
                </p>
              )}
            </div>
            <div className="grid gap-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await signIn.email(
                    {
                      email,
                      password,
                      callbackURL: redirectDestination,
                    },
                    {
                      onRequest: () => {
                        setLoading(true);
                      },
                      onResponse: () => {
                        setLoading(false);
                      },
                      onSuccess: () => {
                        router.push(redirectDestination);
                      },
                    }
                  );
                }}
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      disabled={loading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full justify-center"
                    variant={emailVariant}
                    disabled={loading}
                  >
                    {loading && (
                      <Spinner className="mr-2 size-4" aria-hidden="true" />
                    )}
                    <span>Sign in</span>
                    {emailIsLast && (
                      <>
                        <Badge className="ml-2" variant="secondary">
                          Last used
                        </Badge>
                        <span className="sr-only">Last used login method</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant={googleVariant}
                className="w-full justify-center"
                disabled={loading}
                onClick={async () => {
                  await signIn.social(
                    {
                      provider: "google",
                      callbackURL: redirectDestination,
                    },
                    {
                      onRequest: () => {
                        setLoading(true);
                      },
                      onResponse: () => {
                        setLoading(false);
                      },
                    }
                  );
                }}
              >
                {loading ? (
                  <Spinner className="mr-2 size-4" aria-hidden="true" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 256 262"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                    />
                    <path
                      fill="#34A853"
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                    />
                    <path
                      fill="#FBBC05"
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                    />
                    <path
                      fill="#EB4335"
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                    />
                  </svg>
                )}
                <span>Google</span>
                {googleIsLast && (
                  <>
                    <Badge className="ml-2" variant="secondary">
                      Last used
                    </Badge>
                    <span className="sr-only">Last used login method</span>
                  </>
                )}
              </Button>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="underline underline-offset-4 hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
