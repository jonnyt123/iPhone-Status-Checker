import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, AlertCircle, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { useCreateOrder, useCreateCheckoutSession } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

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
              }
            }
          );
        },
        onError: () => {
          toast({ title: "Order Error", description: "Failed to create order. Please try again.", variant: "destructive" });
        }
      }
    );
  };

  const isPending = createOrder.isPending || createCheckoutSession.isPending;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8 flex items-center justify-between text-sm font-medium text-muted-foreground relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-border -z-10" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 bg-card ${
                step >= i ? "border-primary text-primary" : "border-border"
              } ${step === i ? "ring-4 ring-primary/20" : ""}`}
            >
              {i}
            </div>
          ))}
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Contact Information"}
              {step === 2 && "Device Identifier"}
              {step === 3 && "Payment & Confirmation"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <form id="step1-form" onSubmit={handleNext} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Results will be sent here"
                    data-testid="input-order-email"
                  />
                  <p className="text-sm text-muted-foreground">We never send spam.</p>
                </div>
              </form>
            )}

            {step === 2 && (
              <form id="step2-form" onSubmit={handleNext} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">IMEI or Serial Number</Label>
                  <Input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter 15-digit IMEI or Serial"
                    data-testid="input-order-identifier"
                  />
                  <p className="text-sm text-muted-foreground">Dial *#06# on your phone to find your IMEI.</p>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="bg-muted p-4 rounded-lg flex justify-between items-center text-lg font-semibold">
                  <span>Total Cost</span>
                  <span>$0.99 CAD</span>
                </div>

                <div className="space-y-4 text-sm text-muted-foreground border p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Important Notices</h3>
                  <div className="flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0 text-primary" /><span data-testid="text-order-notice-auth">We return results only from authorized data sources.</span></div>
                  <div className="flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 text-primary" /><span data-testid="text-order-notice-coverage">Blacklist coverage depends on the provider and region.</span></div>
                  <div className="flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 text-primary" /><span data-testid="text-order-notice-unavail">Some checks may be unavailable depending on provider support.</span></div>
                  <div className="flex gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 text-primary" /><span data-testid="text-order-notice-apple">Apple-related statuses are shown only when returned by the configured provider and are not inferred.</span></div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isPending} data-testid="button-order-back">
                Back
              </Button>
            ) : <div />}
            
            {step < 3 ? (
              <Button form={`step${step}-form`} type="submit" data-testid="button-order-next">
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handlePay} disabled={isPending} size="lg" data-testid="button-order-pay">
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Pay $0.99 CAD
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
