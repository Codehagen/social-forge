"use client";

import { Command, useCommandState } from "cmdk";
import { allHelpPosts } from "content-collections";
import Fuse from "fuse.js";
import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import { useDebouncedCallback } from "use-debounce";

import { POPULAR_ARTICLES } from "@/lib/blog/content";

import ExpandingArrow from "./icons/expanding-arrow";
import Magic from "./icons/magic";
import Modal from "./modal";

function CMDKHelper({
  showCMDK,
  setShowCMDK,
}: {
  showCMDK: boolean;
  setShowCMDK: Dispatch<SetStateAction<boolean>>;
}) {
  const commandListRef = useRef<HTMLDivElement>(null);
  const debouncedTrackSearch = useDebouncedCallback((query: string) => {
    // Analytics removed
  }, 1000);

  return (
    <Modal showModal={showCMDK} setShowModal={setShowCMDK}>
      <Command label="CMDK" loop shouldFilter={false}>
        <Command.Input
          autoFocus
          onInput={(e) => {
            setTimeout(() => {
              commandListRef.current?.scrollTo(0, 0);
            }, 0);
            debouncedTrackSearch(e.currentTarget.value);
          }}
          placeholder="Search articles, guides and more..."
          className="w-full border-0 border-b border-gray-100 bg-white px-5 pb-4 pt-5 text-base text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0"
        />
        <Command.List
          ref={commandListRef}
          className="scrollbar-hide h-[50vh] max-h-[340px] min-h-[240px] overflow-y-auto bg-white px-2 pb-3 pt-2 transition-all sm:h-[calc(var(--cmdk-list-height)+10rem)]"
        >
          <Command.Empty className="flex cursor-not-allowed items-center space-x-2 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
            <Magic className="h-4 w-4 text-gray-400" />
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-gray-700">
                Ask AI (Coming soon)
              </p>
              <p className="text-xs text-gray-500">
                Use our AI to find answers to your questions
              </p>
            </div>
          </Command.Empty>
          <CommandResults setShowCMDK={setShowCMDK} />
        </Command.List>
      </Command>
    </Modal>
  );
}

const CommandResults = ({
  setShowCMDK,
}: {
  setShowCMDK: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const popularArticles = POPULAR_ARTICLES.map(
    (slug) => allHelpPosts.find((post) => post.slug === slug)!
  );

  const allItems = [
    ...allHelpPosts.map((post) => ({
      ...post,
      description: post.summary,
    })),
    // get all table of contents headings too
    ...allHelpPosts.flatMap((post) => {
      if (post.excludeHeadingsFromSearch) {
        return [];
      }
      return post.tableOfContents.map(
        (toc: { title: string; slug: string }) => ({
          slug: `${post.slug}#${toc.slug}`,
          title: toc.title,
          description: null, // omit description since we don't want to search it
          summary: `In: "${post.title}"`,
        })
      );
    }),
  ];

  const fuse = useMemo(
    () =>
      new Fuse(allItems, {
        keys: ["title", "description"],
      }),
    [allItems]
  );

  const search = useCommandState((state) => state.search);

  const results = useMemo(() => {
    if (search.length === 0) {
      return popularArticles.filter((article) => article?.slug);
    }
    return fuse
      .search(search)
      .map((r) => r.item)
      .filter((item) => item?.slug);
  }, [search, popularArticles]);

  return results.map(({ slug, title, summary }) => (
    <Command.Item
      key={slug}
      value={title}
      onSelect={() => {
        router.push(`/help/article/${slug}`);
        setShowCMDK(false);
      }}
      className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-gray-50 aria-selected:bg-gray-50"
    >
      <div className="flex flex-col space-y-1">
        <Highlighter
          highlightClassName="underline bg-transparent text-gray-900 font-semibold"
          searchWords={search.split(" ")}
          autoEscape={true}
          textToHighlight={title}
          className="text-sm font-semibold text-gray-900"
        />
        <Highlighter
          highlightClassName="underline bg-transparent text-gray-700"
          searchWords={search.split(" ")}
          autoEscape={true}
          textToHighlight={summary ?? ""}
          className="line-clamp-1 text-xs text-gray-500"
        />
      </div>
      <ExpandingArrow className="invisible -ml-3 h-4 w-4 text-gray-400 group-aria-selected:visible sm:group-hover:visible" />
    </Command.Item>
  ));
};

export default function useCMDK() {
  const [showCMDK, setShowCMDK] = useState(false);

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const existingModalBackdrop = document.getElementById("modal-backdrop");
      if (e.key === "k" && (e.metaKey || e.ctrlKey) && !existingModalBackdrop) {
        e.preventDefault();
        setShowCMDK((showCMDK) => !showCMDK);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const CMDK = useCallback(() => {
    return <CMDKHelper showCMDK={showCMDK} setShowCMDK={setShowCMDK} />;
  }, [showCMDK, setShowCMDK]);

  return useMemo(
    () => ({ showCMDK, setShowCMDK, CMDK }),
    [showCMDK, setShowCMDK, CMDK]
  );
}
