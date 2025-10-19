"use client";

import { cn } from "@/lib/utils";
import { PitchIcons } from "@/components/ui/pitch-icons";
import { motion } from "framer-motion";
import { useState } from "react";

type Props = {
  value: string;
  className?: string;
};

export function CopyInput({ value, className }: Props) {
  const [isCopied, setCopied] = useState(false);

  const handleClipboard = async () => {
    try {
      setCopied(true);
      await navigator.clipboard.writeText(value);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {}
  };

  return (
    <div
      className={cn(
        "relative flex w-full items-center rounded-full border border-foreground/12 bg-background/95 py-2 px-4 text-sm text-muted-foreground shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)] backdrop-blur-sm",
        className
      )}
    >
      <div className="pr-7 truncate">{value}</div>
      <button type="button" onClick={handleClipboard}>
        <span className="sr-only">Copy</span>
        <motion.div
          className="absolute right-4 top-2.5"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: isCopied ? 0 : 1, scale: isCopied ? 0 : 1 }}
        >
          <PitchIcons.Copy />
        </motion.div>

        <motion.div
          className="absolute right-4 top-2.5"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: isCopied ? 1 : 0, scale: isCopied ? 1 : 0 }}
        >
          <PitchIcons.Check />
        </motion.div>
      </button>
    </div>
  );
}
