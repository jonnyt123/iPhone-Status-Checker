import { Layout } from "@/components/layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto prose prose-gray dark:prose-invert">
        <h1 data-testid="text-privacy-title">Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Information We Collect</h2>
        <p>
          We collect the minimum amount of information necessary to provide our service:
          your email address (for delivering results) and the device identifier (IMEI or serial number) to perform the check.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          Your email is used strictly for sending payment receipts and device check results. 
          The device identifier is sent to our authorized data providers to retrieve the device status.
        </p>

        <h2>3. Payment Information</h2>
        <p>
          Payment processing is handled entirely by Stripe. We do not collect, store, or process your credit card information directly.
        </p>

        <h2>4. Data Retention</h2>
        <p>
          We retain order history and results for administrative and support purposes. 
          We employ industry-standard security measures to protect this data.
        </p>
      </div>
    </Layout>
  );
}
