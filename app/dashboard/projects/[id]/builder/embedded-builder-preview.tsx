"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PromptInput,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputButton,
  usePromptInputAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionMenuContent,
  PromptInputActionAddAttachments,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
} from "@/components/ai-elements/web-preview";
import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  Tablet,
  Globe as GlobeIcon,
} from "lucide-react";
import { Response } from "@/components/ai-elements/response";
import { cn } from "@/lib/utils";

type ConversationPart = {
  id: string;
  type: "text" | "reasoning";
  text: string;
  duration?: number;
};

type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  parts: ConversationPart[];
};

export type EmbeddedBuilderPreviewProps = {
  projectName: string;
  builderHref: string;
  statusLabel: string;
  lastUpdatedLabel: string;
  previewUrl?: string | null;
  latestDeploymentUrl?: string;
};

type DeviceMode = "desktop" | "tablet" | "mobile";

const PromptInputSubmitButton = ({ draft }: { draft: string }) => {
  const attachments = usePromptInputAttachments();
  const isDisabled = !draft.trim() && attachments.files.length === 0;

  return (
    <PromptInputSubmit disabled={isDisabled} size="sm">
      <span className="px-3 text-sm font-medium">Open full builder</span>
    </PromptInputSubmit>
  );
};

export function EmbeddedBuilderPreview({
  projectName,
  builderHref,
  statusLabel,
  lastUpdatedLabel,
  previewUrl,
  latestDeploymentUrl,
}: EmbeddedBuilderPreviewProps) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);

  const conversation = useMemo<ConversationMessage[]>(
    () => [
      {
        id: "m-1",
        role: "user",
        parts: [
          {
            id: "m-1-text",
            type: "text",
            text: `Let's refresh ${projectName} with a product-led hero and highlight how the automation flows work.`,
          },
        ],
      },
      {
        id: "m-2",
        role: "assistant",
        parts: [
          {
            id: "m-2-reasoning",
            type: "reasoning",
            text: [
              "Align the hero with the workspace brand colors.",
              "Lead with the primary KPI component alongside the CTA.",
              "Keep footer copy unchanged so existing links stay valid.",
            ].join("\n"),
            duration: 9,
          },
          {
            id: "m-2-text",
            type: "text",
            text: "I'll reuse the gradient background, push a metrics bar under the headline, and keep the call-to-action above the fold for quick conversions.",
          },
        ],
      },
      {
        id: "m-3",
        role: "user",
        parts: [
          {
            id: "m-3-text",
            type: "text",
            text: "Great - can we surface the integration logos and add a short feature grid right below the hero?",
          },
        ],
      },
      {
        id: "m-4",
        role: "assistant",
        parts: [
          {
            id: "m-4-reasoning",
            type: "reasoning",
            text: [
              "Position integrations beside the hero image to keep the layout balanced.",
              "Use a three-up feature grid with concise copy for fast scanning.",
              "Anchor a secondary CTA near the grid so users can continue exploring.",
            ].join("\n"),
            duration: 6,
          },
          {
            id: "m-4-text",
            type: "text",
            text: "Adding a partner strip next to the preview and composing a minimal feature grid now. The standalone builder will let you iterate on the copy live.",
          },
        ],
      },
    ],
    [projectName]
  );

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      setDraft("");
      setUseWebSearch(false);
      router.push(builderHref);
    },
    [builderHref, router]
  );

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full min-h-0 rounded-lg border"
    >
      <ResizablePanel defaultSize={35} minSize={25}>
        <Card className="flex h-full min-h-0 flex-col overflow-hidden border-0 rounded-none">
          <CardContent className="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden p-4">
            <div className="flex flex-1 min-h-[320px] flex-col overflow-hidden">
              <ScrollArea className="h-full rounded-lg border bg-background">
                <div className="flex flex-col gap-4 p-4">
                  {conversation.map((message) => (
                    <Message from={message.role} key={message.id}>
                      <MessageContent
                        variant={
                          message.role === "assistant" ? "flat" : undefined
                        }
                      >
                        {message.parts.map((part) => {
                          if (part.type === "reasoning") {
                            return (
                              <Reasoning
                                key={part.id}
                                className="w-full"
                                defaultOpen={false}
                                duration={part.duration}
                              >
                                <ReasoningTrigger />
                                <ReasoningContent>{part.text}</ReasoningContent>
                              </Reasoning>
                            );
                          }

                          return <Response key={part.id}>{part.text}</Response>;
                        })}
                      </MessageContent>
                    </Message>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>

          <CardFooter className="border-t bg-muted/30 p-4">
            <PromptInput className="flex-1" onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputAttachments>
                  {(attachment) => (
                    <PromptInputAttachment
                      data={attachment}
                      key={attachment.id}
                    />
                  )}
                </PromptInputAttachments>
                <PromptInputTextarea
                  value={draft}
                  onChange={(event) => setDraft(event.currentTarget.value)}
                  placeholder="Outline your next change before opening the full builder..."
                  className="min-h-[64px]"
                />
              </PromptInputBody>
              <PromptInputToolbar>
                <PromptInputTools>
                  <PromptInputActionMenu>
                    <PromptInputActionMenuTrigger />
                    <PromptInputActionMenuContent>
                      <PromptInputActionAddAttachments />
                    </PromptInputActionMenuContent>
                  </PromptInputActionMenu>
                  <PromptInputButton
                    onClick={() => setUseWebSearch((prev) => !prev)}
                    variant={useWebSearch ? "default" : "ghost"}
                  >
                    <GlobeIcon className="h-4 w-4" />
                    <span>Search</span>
                  </PromptInputButton>
                </PromptInputTools>
                <PromptInputSubmitButton draft={draft} />
              </PromptInputToolbar>
            </PromptInput>
          </CardFooter>
        </Card>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={65} minSize={40}>
        <div className="flex h-full min-h-0 flex-col gap-3 p-4">
          <WebPreview
            className={cn(
              "flex flex-1 min-h-[420px] flex-col",
              isFullscreen && "fixed inset-0 z-50 rounded-none"
            )}
            defaultUrl={previewUrl ?? ""}
          >
            <WebPreviewNavigation className="gap-2">
              <WebPreviewNavigationButton
                tooltip="Go back"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </WebPreviewNavigationButton>
              <WebPreviewNavigationButton
                tooltip="Go forward"
                onClick={() => window.history.forward()}
              >
                <ArrowRight className="h-4 w-4" />
              </WebPreviewNavigationButton>
              <WebPreviewUrl
                className="h-8 flex-1 text-xs md:text-sm"
                placeholder="https://"
              />
              <div className="flex items-center gap-1">
                <WebPreviewNavigationButton
                  tooltip="Desktop view"
                  variant={deviceMode === "desktop" ? "secondary" : "ghost"}
                  onClick={() => setDeviceMode("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                </WebPreviewNavigationButton>
                <WebPreviewNavigationButton
                  tooltip="Tablet view"
                  variant={deviceMode === "tablet" ? "secondary" : "ghost"}
                  onClick={() => setDeviceMode("tablet")}
                >
                  <Tablet className="h-4 w-4" />
                </WebPreviewNavigationButton>
                <WebPreviewNavigationButton
                  tooltip="Mobile view"
                  variant={deviceMode === "mobile" ? "secondary" : "ghost"}
                  onClick={() => setDeviceMode("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </WebPreviewNavigationButton>
              </div>
              <WebPreviewNavigationButton
                tooltip={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </WebPreviewNavigationButton>
            </WebPreviewNavigation>
            <div className="relative flex flex-1 items-center justify-center bg-muted/20">
              <div
                className={cn(
                  "h-full transition-all duration-300",
                  deviceMode === "desktop" && "w-full",
                  deviceMode === "tablet" && "w-[768px]",
                  deviceMode === "mobile" && "w-[375px]"
                )}
              >
                <WebPreviewBody
                  className={cn(
                    "bg-white",
                    !previewUrl && "pointer-events-none opacity-40"
                  )}
                  src={previewUrl ?? undefined}
                />
              </div>
              {!previewUrl ? (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  Connect a deployment or domain to enable live preview.
                </div>
              ) : null}
            </div>
          </WebPreview>
          {latestDeploymentUrl && (
            <div className="text-xs text-muted-foreground">
              <Link
                className="font-medium text-primary hover:underline"
                href={latestDeploymentUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open latest deployment in a new tab
              </Link>
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
