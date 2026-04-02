import { Link } from "wouter";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight" data-testid="link-home-logo">
            Trusted IMEI Check
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-home">
              Home
            </Link>
            <Link href="/order" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-order">
              Order
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-contact">
              Contact
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-terms">
              Terms
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
        {children}
      </main>

      <footer className="border-t border-border bg-card mt-auto py-8">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p data-testid="text-footer-copyright">
            Trusted IMEI Check | Results are returned from authorized data sources only.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy</Link>
            <Link href="/refunds" className="hover:text-foreground transition-colors" data-testid="link-footer-refunds">Refunds</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
