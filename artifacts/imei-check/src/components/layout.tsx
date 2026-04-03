import { Link } from "wouter";
import { ReactNode } from "react";
import { Smartphone, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground font-sans">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold text-xl tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity" data-testid="link-home-logo">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            Trusted IMEI
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-home">
              Home
            </Link>
            <Link href="/order" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-order">
              Order Check
            </Link>
            <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-nav-contact">
              Contact
            </Link>
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px] p-6 bg-background">
                <nav className="flex flex-col gap-6 text-lg font-medium mt-10">
                  <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors border-b pb-4">
                    Home
                  </Link>
                  <Link href="/order" className="text-muted-foreground hover:text-foreground transition-colors border-b pb-4">
                    Order Check
                  </Link>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors border-b pb-4">
                    Contact
                  </Link>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors border-b pb-4">
                    Terms & Conditions
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>

      <footer className="bg-muted py-12 border-t mt-auto">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Trusted IMEI Check
            </div>
            <p data-testid="text-footer-copyright">
              Results are returned from authorized data sources only.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-medium">
            <Link href="/terms" className="hover:text-foreground transition-colors" data-testid="link-nav-terms">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy</Link>
            <Link href="/refunds" className="hover:text-foreground transition-colors" data-testid="link-footer-refunds">Refunds</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
