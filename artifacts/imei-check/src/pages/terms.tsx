import { Layout } from "@/components/layout";

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto prose prose-gray dark:prose-invert">
        <h1 data-testid="text-terms-title">Terms of Service</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Service Description</h2>
        <p>
          Trusted IMEI Check provides device status reports based on user-provided IMEI or serial numbers.
          Our service queries authorized third-party databases to retrieve available information.
        </p>

        <h2>2. Data Accuracy and Availability</h2>
        <p>
          We return results only from authorized data sources. Blacklist coverage depends on the provider and region.
          Some checks may be unavailable depending on provider support. Apple-related statuses are shown only when returned by the configured provider and are not inferred.
        </p>

        <h2>3. Payments</h2>
        <p>
          The cost for a single device check is $0.99 CAD. Payments are processed securely via Stripe. 
          By proceeding with an order, you agree to pay this fee.
        </p>

        <h2>4. Delivery</h2>
        <p>
          Results are delivered digitally to the email address provided during the order process. 
          Delivery typically takes a few minutes but may be delayed depending on provider availability.
        </p>
      </div>
    </Layout>
  );
}
