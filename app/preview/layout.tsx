import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website Preview - Social Forge",
  description: "Review and approve your custom website",
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header matching marketing style */}
      <header className="border-b border-foreground/10 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  SF
                </span>
              </div>
              <span className="font-semibold text-lg">
                Social Forge
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Secure Preview Portal
            </div>
          </div>
        </div>
      </header>

      {/* Main content with marketing-style section wrapper */}
      <main className="relative">
        <section className="border-foreground/10 relative border-y">
          <div className="relative z-10 mx-auto max-w-7xl border-x px-3">
            <div className="border-x">
              {/* Decorative top border */}
              <div
                aria-hidden
                className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
              />
              <div className="border-t py-16 md:py-24">
                <div className="mx-auto max-w-7xl px-6">{children}</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer matching marketing style */}
      <footer className="border-t border-foreground/10 mt-auto">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <div>
              © {new Date().getFullYear()} Social Forge. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span>Secure website preview</span>
              <span className="text-primary">•</span>
              <span>Encrypted communications</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
