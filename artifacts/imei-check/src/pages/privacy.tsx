import { Layout } from "@/components/layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="mb-12 border-b pb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4" data-testid="text-privacy-title">Privacy Policy</h1>
          <p className="text-muted-foreground font-medium">Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base">
          <h2>1. Information We Collect</h2>
          <p>
            We collect the absolute minimum amount of information necessary to provide our service:
            your email address (for delivering results and receipts) and the device identifier (IMEI or serial number) required to perform the check.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            Your email is used strictly for sending payment receipts, device check results, and critical customer support communications. We will never sell your email address or send promotional spam.
          </p>
          <p>
            The device identifier you provide is sent securely to our authorized data providers to retrieve the device status. It is not used for any other purpose.
          </p>

          <h2>3. Payment Information</h2>
          <p>
            Payment processing is handled entirely by our secure payment provider, Stripe. We do not collect, store, or process your full credit card information on our servers at any time.
          </p>

          <h2>4. Data Retention</h2>
          <p>
            We retain order history and check results for administrative, accounting, and support purposes. 
            We employ industry-standard security measures to protect this data.
          </p>

          <h2>5. Third-Party Services</h2>
          <p>
            We share data with third parties only when necessary to provide our services. This includes our payment processor (Stripe) and our authorized IMEI checking API providers. These providers are bound by their own strict privacy policies.
          </p>
        </div>
      </div>
    </Layout>
  );
}
