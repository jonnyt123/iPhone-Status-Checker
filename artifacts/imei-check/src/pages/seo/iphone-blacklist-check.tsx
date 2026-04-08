import { useEffect } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";

export default function IphoneBlacklistCheck() {
  useEffect(() => {
    document.title = "iPhone Blacklist Check | Check If Your iPhone Is Blacklisted";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Run an iPhone blacklist check using your IMEI number. Find out if your iPhone is blacklisted before buying or selling. Fast results, $0.99 CAD."
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
                name: "What is an iPhone blacklist check?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "An iPhone blacklist check verifies whether a device IMEI has been reported as lost, stolen, or barred by a carrier. Blacklisted iPhones may be locked to a carrier or refused service.",
                },
              },
              {
                "@type": "Question",
                name: "How do I check if my iPhone is blacklisted?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Enter your iPhone IMEI number and your email address, pay $0.99 CAD plus applicable GST/HST, and receive your blacklist status on-screen and by email.",
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
            iPhone Blacklist Check
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Find out if an iPhone is blacklisted before you buy or sell it. Enter the IMEI and receive your report for $0.99 CAD plus applicable GST/HST.
          </p>
          <Link href="/order">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-md mt-4">
              Start Blacklist Check <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* What is a blacklist check */}
        <Card className="rounded-[2rem] border shadow-md">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-bold">What is an iPhone blacklist check?</h2>
            <p className="text-muted-foreground leading-relaxed">
              An iPhone blacklist check verifies whether a device's IMEI number has been reported as lost, stolen, or barred by a carrier or manufacturer. When an iPhone is blacklisted, it may be blocked from connecting to cellular networks or refused service activation.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Running a blacklist check before purchasing a used iPhone is one of the most important steps to protect yourself from buying a device that cannot be used on a carrier network.
            </p>
          </CardContent>
        </Card>

        {/* How it works */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">How our iPhone blacklist check works</h2>
          <div className="grid gap-4">
            {[
              { n: "1", title: "Enter your email", desc: "Your results will be sent here after the check completes." },
              { n: "2", title: "Enter the IMEI", desc: "Find the IMEI in Settings → General → About, or dial *#06#." },
              { n: "3", title: "Pay securely", desc: "$0.99 CAD + applicable GST/HST via Stripe. No account needed." },
              { n: "4", title: "Receive your result", desc: "Results appear on-screen immediately and are emailed to you." },
            ].map((s) => (
              <div key={s.n} className="flex gap-5 items-start bg-muted/50 rounded-2xl p-5 border">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 text-lg">
                  {s.n}
                </div>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-muted-foreground text-sm mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust notices */}
        <div className="bg-muted rounded-[2rem] p-8 space-y-4 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground text-base">Important information</h3>
          <div className="space-y-3">
            <div className="flex gap-3"><ShieldCheck className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span>We return results only from authorized data sources. We do not maintain our own blacklist database.</span></div>
            <div className="flex gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span>Blacklist coverage depends on the provider and region. Not all carriers report lost or stolen devices in real time.</span></div>
            <div className="flex gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span>Unavailable fields are never inferred or guessed. If data is not returned by the provider, it will appear as "Unavailable from provider."</span></div>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full bg-card rounded-3xl border px-6 shadow-sm">
            <AccordionItem value="q1" className="border-b py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">What does a blacklisted iPhone mean?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                A blacklisted iPhone has been reported to carriers or authorities as lost, stolen, or unpaid. These devices may be blocked from activating on carrier networks, making them difficult or impossible to use as a phone.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2" className="border-b py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">How accurate is the blacklist check?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                Our results come from authorized third-party data sources. Coverage depends on the provider and the region the device was sold in. A "clear" result means the device was not found on the provider's blacklist at the time of the check — not a guarantee against future reports.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3" className="py-2 border-none">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">Can I remove a device from the blacklist?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                No. We are a checking service only and cannot modify blacklist records. To remove a device from a blacklist, you would need to contact the original carrier or reporting authority directly.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <Link href="/order">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-md">
              Check Your iPhone Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </Layout>
  );
}
