import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center space-y-8 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground" data-testid="text-home-headline">
            Fast Device Status Check
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-home-subheadline">
            Pay $0.99 CAD to receive available device-check results by email.
          </p>
        </div>

        <Link href="/order" data-testid="link-home-cta">
          <Button size="lg" className="px-8 text-base h-12">
            Start Check - $0.99 CAD
          </Button>
        </Link>

        <div className="bg-card border border-border rounded-lg p-6 md:p-8 mt-12 w-full text-left space-y-6 shadow-sm">
          <h2 className="font-semibold text-lg border-b pb-4">What you need to know</h2>
          
          <ul className="space-y-4">
            <li className="flex gap-3 text-muted-foreground">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span data-testid="text-notice-auth">We return results only from authorized data sources.</span>
            </li>
            <li className="flex gap-3 text-muted-foreground">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span data-testid="text-notice-coverage">Blacklist coverage depends on the provider and region.</span>
            </li>
            <li className="flex gap-3 text-muted-foreground">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span data-testid="text-notice-unavail">Some checks may be unavailable depending on provider support.</span>
            </li>
            <li className="flex gap-3 text-muted-foreground">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span data-testid="text-notice-apple">Apple-related statuses are shown only when returned by the configured provider and are not inferred.</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
