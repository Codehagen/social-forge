import React from "react";

export function ConvexIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        fill="currentColor"
      />
      <path
        d="M2 17L12 22L22 17"
        fill="currentColor"
      />
      <path
        d="M2 12L12 17L22 12"
        fill="currentColor"
      />
    </svg>
  );
}
