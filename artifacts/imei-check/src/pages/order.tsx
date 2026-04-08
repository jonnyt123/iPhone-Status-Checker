import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, Loader2, ArrowLeft, Info } from "lucide-react";
import { useCreateOrder, useCreateCheckoutSession } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Order() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const { toast } = useToast();

  const createOrder = useCreateOrder();
  const createCheckoutSession = useCreateCheckoutSession();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && !email) return;
    if (step === 2 && !identifier) return;
    setStep((s) => s + 1);
  };

  const handlePay = () => {
    createOrder.mutate(
      { data: { email, identifier, identifierType: "imei" } },
      {
        onSuccess: (order) => {
          createCheckoutSession.mutate(
            { orderId: order.id },
            {
              onSuccess: (session) => {
                window.location.href = session.url;
              },
              onError: () => {
                toast({ title: "Checkout Error", description: "Failed to initialize payment session.", variant: "destructive" });
              },
            }
          );
        },
        onError: () => {
          toast({ title: "Order Error", description: "Failed to create order. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const isPending = createOrder.isPending || createCheckoutSession.isPending;

  return (
    <Layout>
      <div className="max-w-md mx-auto py-12 px-4">

        {/* Progress Indicator */}
        <div className="mb-10 flex items-center justify-between relative px-2">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full -z-10" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                step >= i ? "bg-primary text-primary-foreground shadow-md" : "bg-card border-2 border-border text-muted-foreground"
              } ${step === i ? "ring-4 ring-primary/20 scale-110" : ""}`}
            >
              {i}
            </div>
          ))}
        </div>

        <Card className="rounded-[2rem] border shadow-xl bg-card overflow-hidden">
          <div className="bg-muted/30 px-8 py-6 border-b">
            <h2 className="text-2xl font-bold text-center tracking-tight">
              {step === 1 && "Where should we send it?"}
              {step === 2 && "What's the IMEI?"}
              {step === 3 && "Confirm & Pay"}
            </h2>
          </div>

          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  id="step1-form"
                  onSubmit={handleNext}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-muted-foreground ml-1">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="h-14 rounded-2xl px-4 text-lg bg-background border-border focus-visible:ring-primary"
                      data-testid="input-order-email"
                      autoFocus
                    />
                    <p className="text-sm text-muted-foreground ml-1 flex items-center gap-1.5">
                      <Info className="w-4 h-4" /> Secure delivery. No spam.
                    </p>
                  </div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  id="step2-form"
                  onSubmit={handleNext}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="identifier" className="text-muted-foreground ml-1">IMEI Number</Label>
                    <Input
                      id="identifier"
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="15-digit IMEI"
                      className="h-14 rounded-2xl px-4 text-lg font-mono bg-background border-border focus-visible:ring-primary"
                      data-testid="input-order-identifier"
                      autoFocus
                    />
                    <div className="bg-muted p-4 rounded-2xl text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">How to find your IMEI:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Settings → General → About</li>
                        <li>Dial <span className="font-mono text-foreground font-medium">*#06#</span> on the phone</li>
                      </ul>
                    </div>
                  </div>
                </motion.form>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Order summary */}
                  <div className="bg-background border rounded-2xl p-5 space-y-3 shadow-sm">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Order Summary</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Blacklist Check</span>
                      <span className="font-semibold">$0.99 CAD</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-3">
                      <span className="text-muted-foreground">GST/HST</span>
                      <span className="text-muted-foreground italic">Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t pt-3">
                      <span>Total</span>
                      <span>$0.99 + tax</span>
                    </div>
                  </div>

                  <div className="bg-background border rounded-2xl p-5 space-y-3 shadow-sm">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Included</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-3 font-medium"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /> Blacklist status check</li>
                      <li className="flex items-center gap-3 font-medium"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /> On-screen results page</li>
                      <li className="flex items-center gap-3 font-medium"><CheckCircle2 className="w-5 h-5 text-success shrink-0" /> Email copy of results</li>
                    </ul>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-sm text-muted-foreground space-y-1">
                    <p className="font-semibold text-foreground">What happens next?</p>
                    <p>After payment, your blacklist check will be processed and your results will appear on a receipt-style results page. A copy will also be emailed to you.</p>
                  </div>

                  <div className="space-y-3 text-xs text-muted-foreground bg-muted p-4 rounded-2xl">
                    <div className="flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0 text-foreground" /><span data-testid="text-order-notice-auth">Authorized data sources only.</span></div>
                    <div className="flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 text-foreground" /><span data-testid="text-order-notice-coverage">Blacklist coverage depends on provider and region.</span></div>
                    <div className="flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 text-foreground" /><span data-testid="text-order-notice-unavail">Unavailable fields are not inferred or guessed.</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex gap-3 pt-6 border-t">
              {step > 1 && (
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl h-14 px-4 w-14 p-0 shrink-0 border-2"
                  onClick={() => setStep(step - 1)}
                  disabled={isPending}
                  data-testid="button-order-back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}

              {step < 3 ? (
                <Button
                  form={`step${step}-form`}
                  type="submit"
                  size="lg"
                  className="rounded-2xl h-14 flex-1 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                  data-testid="button-order-next"
                >
                  Continue <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handlePay}
                  disabled={isPending}
                  size="lg"
                  className="rounded-2xl h-14 flex-1 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                  data-testid="button-order-pay"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Securely via Stripe"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
