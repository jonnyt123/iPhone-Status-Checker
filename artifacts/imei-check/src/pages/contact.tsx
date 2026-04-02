import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  return (
    <Layout>
      <div className="max-w-xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold" data-testid="text-contact-title">Contact Support</h1>
          <p className="text-muted-foreground">
            Need help with an order? Send us a message and we'll get back to you.
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Support request submitted."); }}>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" required data-testid="input-contact-email" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="orderId">Order ID (Optional)</Label>
            <Input id="orderId" placeholder="e.g. ord_123456" data-testid="input-contact-orderId" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} placeholder="How can we help?" required data-testid="input-contact-message" />
          </div>

          <Button type="submit" data-testid="button-contact-submit">Send Message</Button>
        </form>

        <div className="pt-8 border-t text-sm text-muted-foreground">
          <p>Alternatively, email us directly at support@trustedimeicheck.ca</p>
        </div>
      </div>
    </Layout>
  );
}
