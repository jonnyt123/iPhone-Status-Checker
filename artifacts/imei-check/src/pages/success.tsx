import { Layout } from "@/components/layout";
import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Success() {
  return (
    <Layout>
      <div className="max-w-md mx-auto text-center space-y-6 py-16">
        <div className="flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-primary" data-testid="icon-success" />
        </div>
        <h1 className="text-3xl font-bold" data-testid="text-success-title">Payment Received</h1>
        <p className="text-muted-foreground text-lg" data-testid="text-success-message">
          Thank you for your order. Your device check is currently processing.
        </p>
        <p className="text-sm border p-4 rounded bg-muted/50" data-testid="text-success-details">
          We will email you the results as soon as they are available. You may close this page.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button variant="outline" data-testid="button-success-home">Return Home</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
