import { Layout } from "@/components/layout";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Cancel() {
  return (
    <Layout>
      <div className="max-w-md mx-auto text-center space-y-6 py-16">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground" data-testid="icon-cancel" />
        </div>
        <h1 className="text-3xl font-bold" data-testid="text-cancel-title">Payment Cancelled</h1>
        <p className="text-muted-foreground text-lg" data-testid="text-cancel-message">
          Your payment was cancelled and your order was not processed.
        </p>
        <div className="pt-4">
          <Link href="/order">
            <Button data-testid="button-cancel-retry">Try Again</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
