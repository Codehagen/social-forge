import React from "react";

export function PlaywrightIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M8 5V19L19 12L8 5Z"
        fill="currentColor"
      />
      <circle cx="5" cy="5" r="2" fill="currentColor" />
      <circle cx="5" cy="19" r="2" fill="currentColor" />
      <circle cx="19" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
