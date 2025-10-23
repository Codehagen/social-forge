import React from "react";

export function FigmaIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect x="3" y="3" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="15" y="3" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="3" y="15" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}
