import { Layout } from "@/components/layout";

export default function Refunds() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="mb-12 border-b pb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4" data-testid="text-refunds-title">Refund Policy</h1>
          <p className="text-muted-foreground font-medium">Last updated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base">
          <p>
            Because our product is a digitally delivered service that incurs direct costs with third-party providers per check, all sales are generally considered final.
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
            Please note that "Unavailable from provider" for specific fields does not constitute a failure of service if other data points were successfully retrieved. We cannot guarantee that all data points (such as Find My status) will be available for every device, as coverage depends entirely on our authorized providers.
          </p>
        </div>
      </div>
    </Layout>
  );
}
