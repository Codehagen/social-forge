import Link from "next/link";

import BlurImage from "@/lib/blog/blur-image";
import { timeAgo } from "@/lib/utils";

type Author = {
  name: string;
  image: string;
};

type Authors = {
  [key: string]: Author;
};

const authors: Authors = {
  codehagen: {
    name: "Christer Hagen",
    image:
      "https://imagedelivery.net/r-6-yk-gGPtjfbIST9-8uA/addc4b60-4c8f-47d7-10ab-6f9048432500/public",
  },
  vsoraas: {
    name: "Stian Walgermo",
    image:
      "https://imagedelivery.net/r-6-yk-gGPtjfbIST9-8uA/76037f97-384f-4681-176e-5b8a0ba71300/public",
  },
};

export default async function Author({
  username,
  updatedAt,
  imageOnly,
}: {
  username: string;
  updatedAt?: string;
  imageOnly?: boolean;
}) {
  if (!authors[username]) {
    console.error(`Author not found: ${username}`);
    return null;
  }

  return imageOnly ? (
    <BlurImage
      src={authors[username].image}
      alt={authors[username].name}
      width={36}
      height={36}
      className="rounded-full transition-all group-hover:brightness-90"
    />
  ) : updatedAt ? (
    <div className="flex items-center space-x-3">
      <BlurImage
        src={authors[username].image}
        alt={authors[username].name}
        width={36}
        height={36}
        className="rounded-full"
      />
      <div className="flex flex-col">
        <p className="text-sm text-warm-white/80">
          Written by {authors[username].name}
        </p>
        <time
          dateTime={updatedAt}
          className="text-sm font-light text-warm-white/60"
        >
          Last updated {timeAgo(new Date(updatedAt))}
        </time>
      </div>
    </div>
  ) : (
    <Link
      href={`https://twitter.com/${username}`}
      className="group flex items-center space-x-3"
      target="_blank"
      rel="noopener noreferrer"
    >
      <BlurImage
        src={authors[username].image}
        alt={authors[username].name}
        width={40}
        height={40}
        className="rounded-full transition-all group-hover:brightness-90"
      />
      <div className="flex flex-col">
        <p className="font-semibold text-warm-white">
          {authors[username].name}
        </p>
        <p className="text-sm text-warm-white/60">@{username}</p>
      </div>
    </Link>
  );
}
