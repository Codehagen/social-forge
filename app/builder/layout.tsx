import { ReactNode } from "react";
import { AppLayoutWrapper } from "@/components/builder/app-layout-wrapper";

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <AppLayoutWrapper>
      {children}
    </AppLayoutWrapper>
  );
}
