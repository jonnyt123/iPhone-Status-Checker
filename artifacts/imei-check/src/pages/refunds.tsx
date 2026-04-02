import { Layout } from "@/components/layout";

export default function Refunds() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto prose prose-gray dark:prose-invert">
        <h1 data-testid="text-refunds-title">Refund Policy</h1>
        
        <p>
          Because our product is a digitally delivered service, all sales are generally considered final.
        </p>

        <h2>Case-by-Case Reviews</h2>
        <p>
          We understand that exceptional circumstances may occur. If you did not receive your report due to a technical error on our end, or if the report was entirely empty and no checks were completed, we may offer a refund.
        </p>

        <p>
          Refunds are considered on a case-by-case basis. To request a review, please contact our support team with your Order ID and the email address used for the purchase.
        </p>
        
        <h2>Unavailable Data</h2>
        <p>
          Please note that "Unavailable from provider" for specific fields does not constitute a failure of service if other data points were successfully retrieved. We cannot guarantee that all data points will be available for every device.
        </p>
      </div>
    </Layout>
  );
}
