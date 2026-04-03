import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare } from "lucide-react";

export default function Contact() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight" data-testid="text-contact-title">Contact Support</h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto font-medium">
            Need help with a device check? Send us a message and our team will get back to you promptly.
          </p>
        </div>

        <Card className="rounded-[2rem] border shadow-xl bg-card overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Support request submitted."); }}>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-muted-foreground ml-1">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  className="h-14 rounded-2xl px-4 bg-background border-border text-lg"
                  data-testid="input-contact-email" 
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="orderId" className="text-muted-foreground ml-1">Order ID (Optional)</Label>
                <Input 
                  id="orderId" 
                  placeholder="e.g. ord_123456" 
                  className="h-14 rounded-2xl px-4 bg-background border-border text-lg font-mono placeholder:font-sans"
                  data-testid="input-contact-orderId" 
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="message" className="text-muted-foreground ml-1">How can we help?</Label>
                <Textarea 
                  id="message" 
                  rows={6} 
                  placeholder="Describe your issue..." 
                  required 
                  className="rounded-2xl p-4 bg-background border-border text-lg resize-none"
                  data-testid="input-contact-message" 
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 rounded-2xl text-base font-semibold shadow-md hover:shadow-lg transition-all mt-4"
                data-testid="button-contact-submit"
              >
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-3 text-muted-foreground font-medium pt-8">
          <Mail className="w-5 h-5 text-primary" />
          <p>Or email us directly at <a href="mailto:support@trustedimeicheck.ca" className="text-foreground hover:text-primary transition-colors">support@trustedimeicheck.ca</a></p>
        </div>
      </div>
    </Layout>
  );
}
