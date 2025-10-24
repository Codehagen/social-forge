"use client";

import { Fragment, useCallback, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";
import { Separator } from "@/components/ui/separator";
import { Sparkles, PartyPopper } from "lucide-react";

export const ToastShowcase = () => {
  const handleSuccess = useCallback(() => {
    toast.success("Workspace published", {
      description: "Followers will see your queued posts in the next sync.",
    });
  }, []);

  const handleError = useCallback(() => {
    toast.error("Invite failed", {
      description: "Double-check the email address or try again later.",
    });
  }, []);

  const handlePromise = useCallback(() => {
    const result = new Promise<void>((resolve, reject) => {
      window.setTimeout(() => {
        if (Math.random() > 0.25) {
          resolve();
        } else {
          reject(new Error("Delivery failed"));
        }
      }, 1400);
    });

    toast.promise(result, {
      loading: "Sending invite…",
      success: "Invite delivered. We emailed the recipient with next steps.",
      error: "Unable to send invite. Review the form and retry.",
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toast notifications</CardTitle>
        <CardDescription>
          Sonner toasts inherit the current theme, announce via aria-live, and support optimistic updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSuccess}>Show success toast</Button>
          <Button variant="outline" onClick={handleError}>
            Show error toast
          </Button>
          <Button variant="ghost" onClick={handlePromise}>
            Simulate invite flow
          </Button>
        </div>
        <Separator />
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Accessibility:</span>{" "}
            Each toast uses <code>aria-live=&quot;polite&quot;</code> and obeys reduced motion.
          </li>
          <li>
            <span className="font-medium text-foreground">Patterns:</span>{" "}
            Keep destructive actions undoable or confirmable; use <code>toast.&quot;promise&quot;</code> for async state.
          </li>
          <li>
            <span className="font-medium text-foreground">Placement:</span>{" "}
            Trigger from inline actions, not navigation, and leave focus on the current task.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

type ConfettiShowcaseProps = {
  confettiRef: React.RefObject<ConfettiRef>;
};

export const ConfettiShowcase = ({ confettiRef }: ConfettiShowcaseProps) => {
  const handleCelebrate = useCallback(() => {
    confettiRef.current?.fire({
      particleCount: 160,
      spread: 70,
      startVelocity: 45,
      scalar: 0.9,
      gravity: 0.9,
    });
    toast.success("Milestone unlocked!", {
      description: "We logged the achievement in the workspace timeline.",
    });
  }, [confettiRef]);

  return (
    <Card>
      <CardHeader className="space-y-2">
        <CardTitle>Celebration effects</CardTitle>
        <CardDescription>
          The reusable confetti canvas pairs with toasts for progress moments without blocking interaction.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/40 p-4">
          <span className="mt-1 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Moment worth celebrating</p>
            <p className="text-sm text-muted-foreground">
              Trigger confetti alongside a toast when a user completes a milestone, launches a campaign, or upgrades.
            </p>
          </div>
        </div>
        <Button onClick={handleCelebrate} className="inline-flex items-center gap-2">
          Fire confetti
          <PartyPopper className="size-4" aria-hidden="true" />
        </Button>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">Placement:</span>{" "}
            Mount a single canvas near the root. Keep it fixed so celebrations fill the viewport.
          </li>
          <li>
            <span className="font-medium text-foreground">Performance:</span>{" "}
            Worker-enabled confetti stays responsive; always respect <code>prefers-reduced-motion</code>.
          </li>
          <li>
            <span className="font-medium text-foreground">Pairing:</span>{" "}
            Align messages with a toast or inline confirmation so users understand why they&apos;re celebrating.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export const ConfettiSection = () => {
  const confettiRef = useRef<ConfettiRef>(null);

  return (
    <Fragment>
      <Confetti
        ref={confettiRef}
        manualstart
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40 h-full w-full"
      />
      <ConfettiShowcase confettiRef={confettiRef} />
    </Fragment>
  );
};
