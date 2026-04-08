import { useEffect } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ShieldCheck, CheckCircle2, AlertCircle, Smartphone,
  Mail, CreditCard, ChevronRight, Lock, ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  useEffect(() => {
    document.title = "iPhone Blacklist Check | Fast IMEI Check";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", "Check your iPhone blacklist status online. Fast IMEI blacklist check with results shown on-screen and emailed after payment.");
  }, []);

  return (
    <Layout>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "name": "iPhone Check",
                "url": "https://iphonecheck.ca",
              },
              {
                "@type": "Organization",
                "name": "iPhone Check",
                "url": "https://iphonecheck.ca",
                "contactPoint": { "@type": "ContactPoint", "contactType": "customer support" },
              },
              {
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "What do I get with my check?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "You receive the available blacklist status for your device, along with basic device details returned by the configured provider.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "How do I receive my results?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "After payment is confirmed, your blacklist-check results are shown on a receipt-style results page and a copy is also sent to your email address.",
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />

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
              Pay $0.99 CAD plus applicable GST/HST to receive your device blacklist status on-screen and by email.
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
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-14 text-lg border-2 bg-transparent hover:bg-muted/50"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
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
                  Preview
                </span>
              </div>
              <div className="flex items-center gap-4 mb-6 border-b pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg text-muted-foreground">Device Check Receipt</h3>
                  <p className="text-muted-foreground text-sm">Brand: — &nbsp; Model: —</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-background rounded-2xl p-4 border">
                  <span className="text-sm font-medium text-muted-foreground">Blacklist Status</span>
                  <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Pending
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Blacklist check results shown on-screen and emailed after payment
              </p>
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
            <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Explicit Statuses Only</div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-4 max-w-5xl mx-auto w-full">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="text-muted-foreground text-lg">Four simple steps to check your iPhone.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Mail, title: "Enter Email", desc: "Where we'll send your results." },
              { icon: Smartphone, title: "Enter IMEI", desc: "Found in Settings or by dialing *#06#." },
              { icon: CreditCard, title: "Make Payment", desc: "Secure checkout via Stripe. GST/HST calculated at checkout." },
              { icon: ChevronRight, title: "Get Results", desc: "Blacklist status shown on-screen and emailed to you." },
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
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">Blacklist Check</h2>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-bold tracking-tighter">$0.99</span>
                <span className="text-xl text-muted-foreground font-medium">CAD</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8">+ applicable GST/HST calculated at checkout</p>
              <ul className="space-y-4 w-full mb-10 text-left">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> <span>Blacklist status check</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> <span>On-screen results + email copy</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> <span>Basic device details from provider</span></li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-primary shrink-0" /> <span>Secure Stripe payment</span></li>
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
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="font-medium text-foreground flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Authorized Sources</p>
              <p>We return results only from authorized data sources. We do not maintain our own blacklist.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground flex items-center gap-2"><AlertCircle className="w-4 h-4 text-primary" /> Coverage Variance</p>
              <p>Blacklist coverage depends on the provider and region. Not all lost or stolen devices are reported immediately.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-foreground flex items-center gap-2"><AlertCircle className="w-4 h-4 text-primary" /> Field Availability</p>
              <p>Some fields may be unavailable depending on provider support. Unavailable fields are never inferred or guessed.</p>
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
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">What do I get with my check?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                You receive the available blacklist status for your device, along with basic device details returned by the configured provider.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-border/50 py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">How do I receive my results?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                After payment is confirmed, your blacklist-check results are shown on a receipt-style results page and a copy is also sent to your email address.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2b" className="border-b-border/50 py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">What if a result is unavailable?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                If the configured provider does not return a blacklist result for the device, the result will be marked as "Unavailable from provider." We never infer or guess statuses.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b-border/50 py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">What does blacklist coverage depend on?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                Blacklist coverage depends entirely on the third-party provider and the region the device was sold in. Not all carriers or countries report lost or stolen devices in real time.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="border-b-border/50 py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">Can you remove a device from the blacklist?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                No. We are strictly a checking service. We provide information on the current blacklist status of a device but cannot modify that status with carriers or manufacturers.
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
