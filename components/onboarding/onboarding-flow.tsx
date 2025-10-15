"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "@/app/actions/onboarding";
import { toast } from "sonner";
import { IconInnerShadowTop, IconFolder, IconCheck, IconRocket } from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";

interface OnboardingFlowProps {
  userName: string | null;
  userEmail: string;
}

const roles = [
  { value: "founder", label: "Founder" },
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "marketer", label: "Marketer" },
];

export function OnboardingFlow({ userName, userEmail }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [firstName, setFirstName] = useState(userName || "");
  const [role, setRole] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  };

  const handleWorkspaceCreation = async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await completeOnboarding({
        role,
        workspaceName: workspaceName.trim(),
        firstName: firstName.trim(),
        businessName: businessName.trim() || workspaceName.trim(),
        businessPhone: businessPhone.trim() || undefined,
      });

      if (result.success) {
        setCurrentStep(3);
        toast.success("Workspace created successfully!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create workspace. Please try again.");
      toast.error(err.message || "Failed to create workspace");
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger confetti on completion step
  useEffect(() => {
    if (currentStep === 3) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [currentStep]);

  const slug = workspaceName ? generateSlug(workspaceName) : "";

  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left Side - Branding */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <IconInnerShadowTop className="mr-2 h-6 w-6" />
          Social Forge
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Transform any website with AI. Build stunning, modern websites
              in minutes, not weeks.&rdquo;
            </p>
            <footer className="text-sm">Social Forge</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side - Onboarding Content */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          {/* Step 1: Introduction & Role Selection */}
          {currentStep === 1 && (
            <>
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Image
                    src="https://pbs.twimg.com/profile_images/1706595242009387008/_mNR89Xa_400x400.jpg"
                    alt="Codehagen"
                    width={96}
                    height={96}
                    className="rounded-full border-4 border-primary/20 shadow-lg"
                    priority
                  />
                </div>
                <div className="flex flex-col space-y-2 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Nice to meet you! ✌️
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    I'm Codehagen, the founder of Social Forge. To start, why don't you introduce yourself :)
                  </p>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First name *</Label>
                    <Input
                      id="firstName"
                      placeholder="Your name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label>What best describes you? *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {roles.map((roleOption) => (
                        <button
                          key={roleOption.value}
                          onClick={() => setRole(roleOption.value)}
                          type="button"
                          className={`p-4 text-left border-2 rounded-lg transition-all ${
                            role === roleOption.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="font-medium">{roleOption.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!firstName.trim() || !role}
                    className="w-full"
                    size="lg"
                  >
                    Continue
                  </Button>
                </div>
              </div>

              <p className="px-8 text-center text-sm text-muted-foreground">
                Need help? Message us{" "}
                <a
                  href="https://x.com/codehagen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  x.com/codehagen
                </a>
              </p>
            </>
          )}

          {/* Step 2: Workspace Creation */}
          {currentStep === 2 && (
            <>
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Create your workspace
                </h1>
                <p className="text-sm text-muted-foreground">
                  A workspace is where you'll organize your projects and collaborate with others
                </p>
              </div>

              <div className="grid gap-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="workspaceName">Workspace Name *</Label>
                    <div className="relative">
                      <IconFolder className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="workspaceName"
                        value={workspaceName}
                        onChange={(e) => {
                          setWorkspaceName(e.target.value);
                          // Auto-populate business name if empty
                          if (!businessName) {
                            setBusinessName(e.target.value);
                          }
                        }}
                        placeholder="My Awesome Workspace"
                        className="pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {slug && (
                      <p className="text-sm text-muted-foreground">
                        Workspace URL: <code className="text-xs bg-secondary px-1 py-0.5 rounded">{slug}</code>
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="businessName">Business Name (Optional)</Label>
                    <Input
                      id="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Acme Agency Inc."
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Shows on prospect approval pages
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="businessPhone">Business Phone (Optional)</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact number for prospects • Email: {userEmail}
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <div className="bg-secondary/50 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-sm">What's a workspace?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• A place to organize all your website projects</li>
                      <li>• Invite team members to collaborate</li>
                      <li>• Switch between multiple workspaces anytime</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleWorkspaceCreation}
                      disabled={!workspaceName.trim() || isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Creating..." : "Create Workspace"}
                    </Button>
                  </div>
                </div>
              </div>

              <p className="px-8 text-center text-sm text-muted-foreground">
                Need help? Message us{" "}
                <a
                  href="https://x.com/codehagen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  x.com/codehagen
                </a>
              </p>
            </>
          )}

          {/* Step 3: Success */}
          {currentStep === 3 && (
            <>
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  You're all set! 🎉
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your workspace has been created and you're ready to start building
                </p>
              </div>

              <div className="grid gap-6">
                <div className="flex items-center justify-center p-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconCheck className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <IconFolder className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Workspace Created</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">
                    {workspaceName}
                  </p>
                </div>

                <Button asChild size="lg" className="w-full">
                  <Link href="/dashboard">
                    <IconRocket className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Link>
                </Button>
              </div>

              <p className="px-8 text-center text-sm text-muted-foreground">
                Need help? Message us{" "}
                <a
                  href="https://x.com/codehagen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  x.com/codehagen
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
