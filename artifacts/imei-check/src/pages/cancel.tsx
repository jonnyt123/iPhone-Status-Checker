import { Layout } from "@/components/layout";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Cancel() {
  return (
    <Layout>
      <div className="max-w-xl mx-auto py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="rounded-[2.5rem] border-0 shadow-2xl bg-card overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-muted to-transparent h-40 pointer-events-none" />
            <CardContent className="p-10 sm:p-14 text-center space-y-8 relative z-10">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-muted text-muted-foreground rounded-full flex items-center justify-center shadow-inner">
                  <AlertCircle className="w-12 h-12" data-testid="icon-cancel" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight" data-testid="text-cancel-title">Payment Cancelled</h1>
                <p className="text-muted-foreground text-lg font-medium max-w-sm mx-auto leading-relaxed" data-testid="text-cancel-message">
                  Your payment was cancelled and your order was not processed.
                </p>
              </div>

              <div className="pt-4">
                <Link href="/order">
                  <Button size="lg" className="rounded-full h-14 px-8 font-semibold shadow-md hover:shadow-lg transition-all" data-testid="button-cancel-retry">
                    Try Again <ArrowRight className="w-5 h-5 ml-2" />
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
