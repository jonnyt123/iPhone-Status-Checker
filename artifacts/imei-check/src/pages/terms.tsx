import { Layout } from "@/components/layout";

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="mb-12 border-b pb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4" data-testid="text-terms-title">Terms of Service</h1>
          <p className="text-muted-foreground font-medium">Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base">
          <h2>1. Service Description</h2>
          <p>
            Trusted IMEI Check provides device status reports based on user-provided IMEI or serial numbers.
            Our service queries authorized third-party databases to retrieve available information. We act as a conduit for this data and do not maintain our own blacklist registries.
          </p>

          <h2>2. Data Accuracy and Availability</h2>
          <p>
            We return results only from authorized data sources. Blacklist coverage depends strictly on the provider and region. Not all devices are reported immediately.
          </p>
          <p>
            Some checks may be unavailable depending on provider support for specific manufacturers or models. Apple-related statuses (such as Find My or Activation Lock) are shown only when explicitly returned by the configured provider and are never inferred.
          </p>

          <h2>3. Payments</h2>
          <p>
            The cost for a single device check is $0.99 CAD. Payments are processed securely via Stripe. 
            By proceeding with an order, you agree to pay this fee for the attempt to check the device status, regardless of whether certain fields are returned as unavailable by the provider.
          </p>

          <h2>4. Delivery</h2>
          <p>
            Results are delivered digitally to the email address provided during the order process. 
            Delivery typically takes a few minutes but may be delayed depending on provider API availability. You will also receive a secure link to view the report online.
          </p>
          
          <h2>5. Limitation of Liability</h2>
          <p>
            The reports provided are for informational purposes only. We are not liable for any financial losses or damages resulting from the purchase or sale of a device based on the data provided in our reports. Always exercise caution when buying used electronics.
          </p>
        </div>
      </div>
    </Layout>
  );
}
