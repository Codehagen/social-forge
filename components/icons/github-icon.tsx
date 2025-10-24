import React from "react";

export function GitHubIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M9 19C4 20.5 4 16.5 2 16M22 16V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H19.5C18.9696 21 18.4609 20.7893 18.0858 20.4142C17.7107 20.0391 17.5 19.5304 17.5 19V16.5C17.5 15.1193 16.3807 14 15 14C13.6193 14 12.5 15.1193 12.5 16.5V19C12.5 19.5304 12.2893 20.0391 11.9142 20.4142C11.5391 20.7893 11.0304 21 10.5 21H10C9.46957 21 8.96086 20.7893 8.58579 20.4142C8.21071 20.0391 8 19.5304 8 19V16.5C8 15.1193 6.88071 14 5.5 14C4.11929 14 3 15.1193 3 16.5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.582 20 9 21C9.5 21.5 10 22 10.5 22C11 22 11.5 21.5 12 21C16.418 20 19 16.418 19 12C19 6.477 14.523 2 12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}