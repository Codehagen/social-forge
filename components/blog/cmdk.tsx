"use client"

import { Command, useCommandState } from "cmdk"
import { allHelpPosts } from "content-collections"
import Fuse from "fuse.js"
import { useRouter } from "next/navigation"
import type { Dispatch, SetStateAction } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Highlighter from "react-highlight-words"
import { useDebouncedCallback } from "use-debounce"

import { POPULAR_ARTICLES } from "@/lib/blog/content"

import ExpandingArrow from "./icons/expanding-arrow"
import Magic from "./icons/magic"
import Modal from "./modal"

function CMDKHelper({
  showCMDK,
  setShowCMDK,
}: {
  showCMDK: boolean
  setShowCMDK: Dispatch<SetStateAction<boolean>>
}) {
  const commandListRef = useRef<HTMLDivElement>(null)
  const debouncedTrackSearch = useDebouncedCallback((query: string) => {
    // Analytics removed
  }, 1000)

  return (
    <Modal
      showModal={showCMDK}
      setShowModal={setShowCMDK}
      className="sm:max-w-xl"
    >
      <Command label="CMDK" loop shouldFilter={false}>
        <Command.Input
          autoFocus
          onInput={(e) => {
            setTimeout(() => {
              commandListRef.current?.scrollTo(0, 0)
            }, 0)
            debouncedTrackSearch(e.currentTarget.value)
          }}
          placeholder="Søk etter artikler, guider og mer..."
          className="w-full border-none bg-warm-white p-4 font-normal text-warm-grey focus:outline-none focus:ring-0 dark:bg-warm-grey dark:text-warm-white"
        />
        <Command.List
          ref={commandListRef}
          className="scrollbar-hide h-[50vh] max-h-[360px] min-h-[250px] overflow-scroll border-t border-warm-grey-2 bg-warm-white p-2 transition-all sm:h-[calc(var(--cmdk-list-height)+10rem)] dark:bg-warm-grey"
        >
          <Command.Empty className="flex cursor-not-allowed items-center space-x-2 rounded-md bg-warm-grey-1/10 px-4 py-2 text-sm text-warm-grey dark:text-warm-white">
            <Magic className="h-4 w-4 text-warm-grey-2" />
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-warm-grey dark:text-warm-white">
                Spør AI (Coming soon)
              </p>
              <p className="text-xs text-warm-grey-2">
                Bruk vår AI til å finne svar på dine spørsmål
              </p>
            </div>
          </Command.Empty>
          <CommandResults setShowCMDK={setShowCMDK} />
        </Command.List>
      </Command>
    </Modal>
  )
}

const CommandResults = ({
  setShowCMDK,
}: {
  setShowCMDK: Dispatch<SetStateAction<boolean>>
}) => {
  const router = useRouter()
  const popularArticles = POPULAR_ARTICLES.map(
    (slug) => allHelpPosts.find((post) => post.slug === slug)!,
  )

  const allItems = [
    ...allHelpPosts.map((post) => ({
      ...post,
      description: post.summary,
    })),
    // get all table of contents headings too
    ...allHelpPosts.flatMap((post) => {
      if (post.excludeHeadingsFromSearch) {
        return []
      }
      return post.tableOfContents.map(
        (toc: { title: string; slug: string }) => ({
          slug: `${post.slug}#${toc.slug}`,
          title: toc.title,
          description: null, // omit description since we don't want to search it
          summary: `In: "${post.title}"`,
        }),
      )
    }),
  ]

  const fuse = useMemo(
    () =>
      new Fuse(allItems, {
        keys: ["title", "description"],
      }),
    [allItems],
  )

  const search = useCommandState((state) => state.search)

  const results = useMemo(() => {
    if (search.length === 0) {
      return popularArticles.filter((article) => article?.slug)
    }
    return fuse
      .search(search)
      .map((r) => r.item)
      .filter((item) => item?.slug)
  }, [search, popularArticles])

  return results.map(({ slug, title, summary }) => (
    <Command.Item
      key={slug}
      value={title}
      onSelect={() => {
        router.push(`/help/article/${slug}`)
        setShowCMDK(false)
      }}
      className="group flex cursor-pointer items-center justify-between space-x-2 rounded-md px-4 py-2 hover:bg-warm-grey-1/10 active:bg-warm-grey-1/20 aria-selected:bg-warm-grey-1/10"
    >
      <div className="flex flex-col space-y-1">
        <Highlighter
          highlightClassName="underline bg-transparent text-warm-grey dark:text-warm-white font-medium"
          searchWords={search.split(" ")}
          autoEscape={true}
          textToHighlight={title}
          className="text-sm font-medium text-warm-grey group-aria-selected:text-warm-grey-2 sm:group-hover:text-warm-grey-2 dark:text-warm-white dark:group-aria-selected:text-warm-grey-1"
        />
        <Highlighter
          highlightClassName="underline bg-transparent text-warm-grey dark:text-warm-white"
          searchWords={search.split(" ")}
          autoEscape={true}
          textToHighlight={summary}
          className="line-clamp-1 text-xs text-warm-grey-2"
        />
      </div>
      <ExpandingArrow className="invisible -ml-4 h-4 w-4 text-warm-grey-2 group-aria-selected:visible sm:group-hover:visible dark:text-warm-grey-1" />
    </Command.Item>
  ))
}

export default function useCMDK() {
  const [showCMDK, setShowCMDK] = useState(false)

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const existingModalBackdrop = document.getElementById("modal-backdrop")
      if (e.key === "k" && (e.metaKey || e.ctrlKey) && !existingModalBackdrop) {
        e.preventDefault()
        setShowCMDK((showCMDK) => !showCMDK)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const CMDK = useCallback(() => {
    return <CMDKHelper showCMDK={showCMDK} setShowCMDK={setShowCMDK} />
  }, [showCMDK, setShowCMDK])

  return useMemo(
    () => ({ showCMDK, setShowCMDK, CMDK }),
    [showCMDK, setShowCMDK, CMDK],
  )
}
