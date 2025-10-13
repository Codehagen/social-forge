"use client";
import { ArrowUp, FigmaIcon, PlusIcon } from "lucide-react";
import {
  PromptInput,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/prompt-input";
import { useState } from "react";
import { Suggestion } from "@/components/suggestion";
import { TypingAnimation } from "@/components/ai-elements/typing-animation";

export const ProductIllustration = () => {
  const [value, setValue] = useState("");

  const suggestions = [
    {
      label: "Restaurant website",
      prompt:
        "Create a modern website for my Italian restaurant with online menu, reservation system, and photo gallery of dishes",
    },
    {
      label: "Upgrade my site",
      prompt:
        "Redesign and upgrade my existing plumbing business website to be more modern, mobile-friendly, and include a booking form",
    },
    {
      label: "Portfolio site",
      prompt:
        "Build a professional portfolio website for my photography business with image galleries, client testimonials, and contact form",
    },
    {
      label: "Landing page",
      prompt:
        "Create a high-converting landing page for my SaaS startup with features, pricing tiers, and demo request form",
    },
    {
      label: "E-commerce store",
      prompt:
        "Make an online store for my boutique clothing business with product catalog, shopping cart, and payment integration",
    },
    {
      label: "Service business",
      prompt:
        "Build a website for my cleaning service business with service descriptions, pricing packages, and online booking system",
    },
    {
      label: "Professional site",
      prompt:
        "Create a modern website for my law firm with practice areas, attorney profiles, case studies, and consultation booking",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-xl">
      <PromptInput onSubmit={() => {}} className="relative">
        {!value && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 text-muted-foreground no-underline">
            <span className="no-underline">Ask Social Forge to make </span>
            <TypingAnimation
              words={[
                "a new modern website for www.socialforge.tech...",
                "an upgraded website for my plumbing business...",
                "a portfolio site for my photography studio...",
                "a landing page for my SaaS startup...",
                "an e-commerce store for my boutique...",
              ]}
              loop={true}
              typeSpeed={50}
              deleteSpeed={30}
              pauseDelay={800}
              className="inline leading-normal tracking-normal no-underline decoration-none"
              showCursor={false}
            />
          </div>
        )}
        <PromptInputTextarea
          onChange={(e) => setValue(e.target.value)}
          value={value}
          placeholder=""
        />
        <PromptInputToolbar>
          <PromptInputTools className="gap-0">
            <PromptInputButton className="size-8">
              <PlusIcon size={16} />
            </PromptInputButton>
            <PromptInputButton className="h-8 px-2.5">
              <FigmaIcon size={16} />
              <span>Design</span>
            </PromptInputButton>
          </PromptInputTools>
          <PromptInputSubmit
            className="absolute bottom-1 right-1 size-8 shadow-black/25"
            disabled={!value}
            status={"ready"}
          >
            <ArrowUp strokeWidth={3} />
          </PromptInputSubmit>
        </PromptInputToolbar>
      </PromptInput>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {suggestions.map((suggestion, index) => (
          <Suggestion
            key={index}
            onClick={() => setValue(suggestion.prompt)}
            suggestion={suggestion.label}
          />
        ))}
      </div>
    </div>
  );
};
