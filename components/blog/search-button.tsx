"use client";

import { IconSearch } from "@tabler/icons-react";
import useCMDK from "./cmdk";

// import { AppContext } from "@/components/providers"

export default function SearchButton() {
  const { setShowCMDK, CMDK } = useCMDK();

  return (
    <>
      <button
        onClick={() => setShowCMDK(true)}
        className="group relative flex focus:outline-none"
      >
        <IconSearch className="text-muted-foreground absolute inset-y-0 left-4 z-10 my-auto h-4 w-4" />
        <div className="border-border bg-background text-muted-foreground group-active:bg-muted w-full rounded-xl border p-3 pl-12 text-left transition-colors">
          Search articles...
        </div>
        <span className="text-muted-foreground absolute inset-y-0 right-4 my-auto h-5 text-sm">
          ⌘K
        </span>
      </button>
      <CMDK />
    </>
  );
}
