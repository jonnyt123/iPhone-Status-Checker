import { useEffect } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function CheckIfIphoneIsBlacklisted() {
  useEffect(() => {
    document.title = "Check If an iPhone Is Blacklisted | IMEI Status Lookup";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Check if an iPhone is blacklisted using its IMEI. Fast, accurate blacklist status lookup for $0.99 CAD plus applicable GST/HST. Results on-screen and by email."
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
                name: "How can I check if an iPhone is blacklisted?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Enter the iPhone's IMEI number on our order page, pay $0.99 CAD plus applicable GST/HST, and receive your blacklist status on-screen and by email within minutes.",
                },
              },
              {
                "@type": "Question",
                name: "What happens if an iPhone is blacklisted?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "A blacklisted iPhone may be blocked from connecting to carrier networks. It could be locked to no carrier or refused activation, making it unusable as a phone.",
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
            Check If an iPhone Is Blacklisted
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Use our IMEI lookup to find out if an iPhone has been blacklisted. Get your result on-screen and by email for $0.99 CAD plus applicable GST/HST.
          </p>
          <Link href="/order">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-md mt-4">
              Check Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Why check */}
        <Card className="rounded-[2rem] border shadow-md">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-bold">Why check if an iPhone is blacklisted?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Buying a used iPhone without checking its blacklist status is risky. A device that looks perfectly functional could be blocked by carriers due to being reported stolen, lost, or associated with an unpaid contract. Once blacklisted, these devices often cannot be activated on any major carrier network.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our check helps you make an informed decision before completing a purchase. We query authorized data sources and return the current blacklist status for the IMEI you provide.
            </p>
          </CardContent>
        </Card>

        {/* Signs */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Signs an iPhone may be blacklisted</h2>
          <div className="grid gap-3">
            {[
              "The seller is unwilling to let you verify the device before purchase.",
              "The device cannot activate on a carrier network despite being unlocked.",
              "The asking price seems significantly lower than market value.",
              "The seller does not have the original purchase receipt or box.",
            ].map((s, i) => (
              <div key={i} className="flex gap-3 items-start bg-muted/50 border rounded-2xl p-4">
                <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Running a blacklist check before purchase is the most reliable way to verify a device's status.</p>
        </div>

        {/* What you get */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">What you get with your check</h2>
          <div className="grid gap-3">
            {[
              "Blacklist status returned from authorized data sources",
              "On-screen results shown immediately after payment",
              "Email copy of results sent to your inbox",
              "Basic device details returned by the provider (brand, model, manufacturer)",
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust notices */}
        <div className="bg-muted rounded-[2rem] p-8 space-y-4 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground text-base">Our data and limitations</h3>
          <div className="space-y-3">
            <div className="flex gap-3"><ShieldCheck className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span>Results come from authorized third-party data sources only. We do not operate our own blacklist database.</span></div>
            <div className="flex gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span>Blacklist coverage depends on the provider and the region of the device. Some regions have limited reporting.</span></div>
            <div className="flex gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-foreground mt-0.5" /><span>A clear result reflects the device status at the time of the check. It is not a guarantee against future reports.</span></div>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full bg-card rounded-3xl border px-6 shadow-sm">
            <AccordionItem value="q1" className="border-b py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">Can a blacklisted iPhone be unlocked?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                Being blacklisted is different from being carrier-locked. A blacklisted iPhone has been reported to authorities or carriers and may be blocked at the network level regardless of whether it is SIM-unlocked. We cannot remove devices from blacklists.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2" className="border-b py-2">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">What if the result shows "Unavailable from provider"?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                This means the data provider did not return a result for this specific IMEI. It does not mean the device is blacklisted or clear — it simply means the provider did not have data for it. We never infer or guess a status.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3" className="py-2 border-none">
              <AccordionTrigger className="text-base font-semibold hover:no-underline hover:text-primary">How long does the check take?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-base">
                Results are typically available within minutes. After payment is confirmed, the check runs automatically and you are shown your results on a receipt-style page. A copy is also emailed to you.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <Link href="/order">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-md">
              Check iPhone Blacklist Status <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

      </div>
    </Layout>
  );
}
