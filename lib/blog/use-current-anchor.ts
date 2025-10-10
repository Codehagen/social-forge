import { useEffect, useState } from "react";

export default function useCurrentAnchor() {
  const [currentAnchor, setCurrentAnchor] = useState<string | null>(null);

  useEffect(() => {
    const mdxContainer = document.querySelector("[data-mdx-container]");
    if (!mdxContainer) return;

    // Get all h2 elements within the MDX container
    const headings = Array.from(mdxContainer.querySelectorAll("h2"));
    if (headings.length === 0) return;

    const getActiveHeading = () => {
      const scrollY = window.scrollY;
      const headerOffset = 100; // Adjust based on your header height

      // Find the last heading that's above our scroll position
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const headingTop = heading.getBoundingClientRect().top + scrollY;

        if (scrollY >= headingTop - headerOffset) {
          return heading.id;
        }
      }

      // If no heading is found, return the first one
      return headings[0].id;
    };

    const onScroll = () => {
      const activeHeading = getActiveHeading();
      setCurrentAnchor(activeHeading);
    };

    // Initial check
    onScroll();

    // Add scroll listener
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return currentAnchor;
}
