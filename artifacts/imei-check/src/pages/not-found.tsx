import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
        <Card className="w-full max-w-md rounded-[2rem] border-0 shadow-xl overflow-hidden">
          <CardContent className="p-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground">
                <AlertCircle className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Page Not Found</h1>
              <p className="text-muted-foreground font-medium">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>

            <div className="pt-4">
              <Link href="/">
                <Button size="lg" className="rounded-full h-12 px-8 font-semibold">
                  Go Home <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
