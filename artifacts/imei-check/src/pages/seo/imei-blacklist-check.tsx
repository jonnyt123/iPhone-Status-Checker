import { useEffect } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";

export default function ImeiBlacklistCheck() {
  useEffect(() => {
    document.title = "IMEI Blacklist Check | Check Any Phone IMEI Status";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Run an IMEI blacklist check on any iPhone. Verify the IMEI status before buying a used device. Fast results for $0.99 CAD plus applicable GST/HST."
    );
  }, []);

  return (
    <Layout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is an IMEI blacklist check?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "An IMEI blacklist check queries authorized databases to determine whether a device's unique IMEI number has been reported as lost, stolen, or barred by a carrier.",
                },
              },
              {
                "@type": "Question",
                name: "How do I find my IMEI number?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "On an iPhone, go to Settings → General → About and scroll to IMEI. You can also dial *#06# on the phone to display the IMEI.",
                },
              },
            ],
          }),
        }}
      />

      <div className="max-w-3xl mx-auto px-4 py-16 space-y-16">

        {/* Hero */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            IMEI Blacklist Check
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Verify any iPhone IMEI blacklist status instantly. Know if a device has been reported lost, stolen, or barred — before you buy.
          </p>
          <Link href="/order">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-md mt-4">
              Check IMEI Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Explainer */}
        <Card className="rounded-[2rem] border shadow-md">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-bold">What is an IMEI and why does it matter?</h2>
            <p className="text-muted-foreground leading-relaxed">
              The IMEI (International Mobile Equipment Identity) is a unique 15-digit number assigned to every mobile device. It works like a serial number that carriers and authorities use to track devices.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              When a device is reported lost or stolen, its IMEI can be added to a blacklist database. Carriers use this database to block blacklisted devices from accessing their networks. Checking the IMEI before purchasing a used iPhone tells you whether the device may be unusable on a carrier.
            </p>
          </CardContent>
        </Card>

        {/* How to find IMEI */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">How to find the IMEI on an iPhone</h2>
          <div className="grid gap-4">
            {[
              { title: "Settings method", desc: "Go to Settings → General → About and scroll down to find the IMEI field." },
              { title: "Dial code method", desc: "Open the Phone app and dial *#06#. The IMEI will appear on screen immediately." },
              { title: "Physical label", desc: "The IMEI may be printed on the SIM card tray or the device box." },
            ].map((m, i) => (
              <div key={i} className="bg-muted/50 rounded-2xl p-5 border space-y-1">
                <p className="font-semibold">{m.title}</p>
                <p className="text-muted-foreground text-sm">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust notices */}
        <div className="bg-muted rounded-[2rem] p-8 space-y-4 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground text-base">About our results</h3>
          <div className="space-y-3">
            <div className="flex gap-3"><ShieldCheck className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span>Results come from authorized third-party data sources only.</span></div>
            <div className="flex gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span>Coverage depends on the data provider and the region of the device.</span></div>
            <div className="flex gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span>A clear result means the IMEI was not found on the provider's blacklist at the time of the check.</span></div>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full bg-card rounded-3xl border px-6 shadow-sm">
            <AccordionItem value="q1" className="border-b py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">Is the IMEI check accurate?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                Results reflect what our authorized data providers return at the time of the check. Coverage varies by region and carrier. A "clear" result does not guarantee the device will never be blacklisted in the future.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2" className="border-b py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">Does this work for all iPhone models?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                Our service works for iPhones and other devices that can provide a valid 15-digit IMEI number. Provider coverage may vary depending on the device model and region.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3" className="py-2 border-none">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">How long does a check take?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                Results are typically available within minutes of confirmed payment. You will be redirected to your results page automatically after Stripe confirms your payment.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <Link href="/order">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-md">
              Start IMEI Check <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </Layout>
  );
}
