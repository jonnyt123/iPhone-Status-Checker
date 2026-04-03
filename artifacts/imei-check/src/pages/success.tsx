import { Layout } from "@/components/layout";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Success() {
  return (
    <Layout>
      <div className="max-w-xl mx-auto py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="rounded-[2.5rem] border-0 shadow-2xl bg-card overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-success/5 to-transparent h-40 pointer-events-none" />
            <CardContent className="p-10 sm:p-14 text-center space-y-8 relative z-10">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-12 h-12" data-testid="icon-success" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight" data-testid="text-success-title">Payment Received</h1>
                <p className="text-muted-foreground text-lg font-medium max-w-sm mx-auto leading-relaxed" data-testid="text-success-message">
                  Thank you. Your device check is currently processing securely.
                </p>
              </div>

              <div className="bg-background rounded-2xl p-6 border shadow-sm" data-testid="text-success-details">
                <p className="text-muted-foreground font-medium">
                  We will email you the detailed report as soon as it is available (usually within minutes). You may close this page.
                </p>
              </div>

              <div className="pt-4">
                <Link href="/">
                  <Button variant="outline" size="lg" className="rounded-full h-14 px-8 border-2 font-semibold hover:bg-muted transition-colors" data-testid="button-success-home">
                    Return Home <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
