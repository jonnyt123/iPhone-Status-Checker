import { logger } from "./logger";

interface ResultEmailData {
  orderId: string;
  email: string;
  checkedAt: Date | null;
  identifierMasked: string;
  identifierType: string;
  providerName: string | null;
  brand: string | null;
  model: string | null;
  manufacturer: string | null;
  blacklistStatus: string | null;
  activationLockStatus: string | null;
  findMyStatus: string | null;
  providerCoverageNotes: string | null;
}

function formatStatus(status: string | null): string {
  if (!status || status === "unavailable") return "Unavailable from provider";
  if (status === "error") return "Error retrieving from provider";
  if (status === "clear") return "Clear";
  if (status === "blacklisted") return "Blacklisted";
  if (status === "on") return "On";
  if (status === "off") return "Off";
  return "Unavailable from provider";
}

function buildEmailHtml(data: ResultEmailData): string {
  const supportEmail = process.env.SUPPORT_EMAIL ?? "support@example.com";
  const checkedAtStr = data.checkedAt
    ? new Date(data.checkedAt).toLocaleString("en-CA", { timeZone: "America/Toronto" })
    : "N/A";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your device check results</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h1 style="font-size: 22px; color: #1a1a2e;">Trusted IMEI Check — Your Results</h1>
  <p>Thank you for using Trusted IMEI Check. Here are the results of your device check.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background: #f5f5f5;">
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Order ID</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${data.orderId}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Date/Time</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${checkedAtStr}</td>
    </tr>
    <tr style="background: #f5f5f5;">
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Identifier</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${data.identifierMasked} (${data.identifierType.toUpperCase()})</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Provider</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${data.providerName ?? "Unavailable from provider"}</td>
    </tr>
    <tr style="background: #f5f5f5;">
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Brand</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${data.brand ?? "Unavailable from provider"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Model</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${data.model ?? "Unavailable from provider"}</td>
    </tr>
    <tr style="background: #f5f5f5;">
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Manufacturer</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${data.manufacturer ?? "Unavailable from provider"}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Blacklist Status</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${formatStatus(data.blacklistStatus)}</td>
    </tr>
    <tr style="background: #f5f5f5;">
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Activation Lock</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${formatStatus(data.activationLockStatus)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Find My</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${formatStatus(data.findMyStatus)}</td>
    </tr>
    ${data.providerCoverageNotes ? `
    <tr style="background: #f5f5f5;">
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Provider Notes</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${data.providerCoverageNotes}</td>
    </tr>` : ""}
  </table>

  <div style="background: #f0f4ff; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #555;">
    <strong>Important Notices:</strong>
    <ul style="margin: 8px 0; padding-left: 20px;">
      <li>We return results only from authorized data sources.</li>
      <li>Blacklist coverage depends on the provider and region.</li>
      <li>Some checks may be unavailable depending on provider support.</li>
      <li>Apple-related statuses are shown only when returned by the configured provider and are not inferred.</li>
      <li>Fields showing "Unavailable from provider" were not inferred — they were simply not returned by the provider for this device.</li>
    </ul>
  </div>

  <p>If you have questions about your results, please contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
  <p style="font-size: 12px; color: #999;">Trusted IMEI Check | Results are returned from authorized data sources only.</p>
</body>
</html>`;
}

export async function sendResultEmail(data: ResultEmailData): Promise<void> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    logger.warn({ orderId: data.orderId }, "SendGrid not configured — skipping email");
    return;
  }

  try {
    const sgMail = await import("@sendgrid/mail");
    sgMail.default.setApiKey(apiKey);

    await sgMail.default.send({
      to: data.email,
      from: fromEmail,
      subject: "Your device check results",
      html: buildEmailHtml(data),
    });

    logger.info({ orderId: data.orderId, email: data.email }, "Result email sent");
  } catch (err) {
    logger.error({ err, orderId: data.orderId }, "Failed to send result email");
    throw err;
  }
}
