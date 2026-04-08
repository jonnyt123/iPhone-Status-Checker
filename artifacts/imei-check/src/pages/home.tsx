import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShieldCheck, CheckCircle2, AlertCircle, Smartphone, Mail, CreditCard, ChevronRight, Lock, Check, X, HelpCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col space-y-24 pb-20">
        
        {/* Hero Section */}
        <section className="pt-20 pb-10 px-4 flex flex-col items-center text-center space-y-10 relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground" data-testid="text-home-headline">
              Fast iPhone IMEI Check
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium" data-testid="text-home-subheadline">
              Pay $0.99 CAD to receive available device-check results on-screen and by email.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full"
          >
            <Link href="/order" data-testid="link-home-cta">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg shadow-md hover:shadow-lg transition-all active:scale-95">
                Start Check
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg border-2 bg-transparent hover:bg-muted/50" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
              How It Works
            </Button>
          </motion.div>

          {/* Hero Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-lg mt-12"
          >
            <div className="bg-card rounded-3xl p-6 shadow-xl border relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <div className="absolute top-3 right-3">
                <span className="bg-muted text-muted-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider border">
                  Sample layout
                </span>
              </div>
              <div className="flex items-center gap-4 mb-6 border-b pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg text-muted-foreground">Device Check Receipt</h3>
                  <p className="text-muted-foreground text-sm">Brand: —&nbsp;&nbsp;Model: —</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-background rounded-2xl p-4 border">
                  <span className="text-sm font-medium text-muted-foreground">Blacklist Status</span>
                  <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Pending
                  </span>
                </div>
                <div className="flex justify-between items-center bg-background rounded-2xl p-4 border">
                  <span className="text-sm font-medium text-muted-foreground">Activation Lock</span>
                  <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Pending
                  </span>
                </div>

              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">Results shown on-screen and emailed to you after payment</p>
            </div>
          </motion.div>

          {/* Trust Strip */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium text-muted-foreground mt-8 max-w-3xl"
          >
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Authorized Sources Only</div>
            <div className="flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> Provider Dependent</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Explicit Statuses</div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-4 max-w-5xl mx-auto w-full">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="text-muted-foreground text-lg">Four simple steps to peace of mind.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Mail, title: "Enter Email", desc: "Where we'll send the report." },
              { icon: Smartphone, title: "Enter IMEI", desc: "Found in Settings or dialing *#06#." },
              { icon: CreditCard, title: "Pay $0.99", desc: "Secure checkout via Stripe." },
              { icon: ChevronRight, title: "Get Results", desc: "Shown on-screen and emailed to you." }
            ].map((step, i) => (
              <Card key={i} className="rounded-3xl border-none shadow-md bg-card">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-sm text-primary mb-2">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="px-4 max-w-lg mx-auto w-full">
          <Card className="rounded-[2.5rem] border overflow-hidden shadow-2xl bg-card">
            <CardContent className="p-12 flex flex-col items-center text-center">
              <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Single Check</h2>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-6xl font-bold tracking-tighter">$0.99</span>
                <span className="text-xl text-muted-foreground font-medium">CAD</span>
              </div>
              <ul className="space-y-4 w-full mb-10 text-left">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span>On-screen results + email copy</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span>Blacklist status check</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span>Activation lock status (when available)</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary" /> <span>Secure Stripe payment</span></li>
              </ul>
              <Link href="/order" className="w-full">
                <Button size="lg" className="w-full rounded-full h-14 text-lg">
                  Start Check <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Disclaimers & Trust */}
        <section className="px-4 max-w-4xl mx-auto w-full bg-muted rounded-[2rem] p-10 space-y-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-6 h-6 text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Important Information</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="font-medium text-foreground flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Authorized Sources</p>
              <p>We return results only from authorized data sources. We do not maintain our own blacklist.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground flex items-center gap-2"><AlertCircle className="w-4 h-4 text-primary" /> Coverage Variance</p>
              <p>Blacklist coverage depends entirely on the provider and region. Not all lost or stolen devices are reported immediately.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground flex items-center gap-2"><AlertCircle className="w-4 h-4 text-primary" /> Feature Availability</p>
              <p>Some checks (like Find My or Activation Lock) may be unavailable depending on current provider support.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Explicit Statuses</p>
              <p>Apple-related statuses are shown only when returned by the configured provider and are not inferred or guessed.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 max-w-3xl mx-auto w-full space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full bg-card rounded-3xl border px-6 shadow-sm">
            <AccordionItem value="item-1" className="border-b-border/50 py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">What is an IMEI?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                The International Mobile Equipment Identity (IMEI) is a unique 15-digit serial number given to every mobile phone. You can usually find it in your device settings or by dialing *#06#.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-border/50 py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">How do I receive my results?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                After your payment is confirmed, your device-check results are shown on a receipt-style results page and a copy is also sent to your email address.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2b" className="border-b-border/50 py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">How long do results take?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                Results are typically processed within minutes of successful payment. You will be redirected to your results page automatically.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b-border/50 py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">What if a field shows "Unavailable"?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                Our service relies on third-party providers. If a specific check (like Activation Lock) is currently unsupported by the provider for your device model, it will show as unavailable. We do not guess or infer statuses.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-b-border/50 py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">Can you un-blacklist a device?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                No. We are strictly a checking service. We provide information on the current status of a device but cannot modify that status with carriers or manufacturers.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5" className="border-none py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">Do you offer refunds?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                Refunds are assessed on a case-by-case basis. If our system fails to provide a result due to a technical error on our end, we will gladly refund the charge.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

      </div>
    </Layout>
  );
}
