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
  providerCoverageNotes: string | null;
}

function formatBlacklistStatus(status: string | null): string {
  if (!status || status === "unavailable") return "Unavailable from provider";
  if (status === "error") return "Error retrieving from provider";
  if (status === "clear") return "Clear";
  if (status === "blacklisted") return "Blacklisted";
  return "Unavailable from provider";
}

function buildEmailHtml(data: ResultEmailData): string {
  const supportEmail = process.env.SUPPORT_EMAIL ?? "support@example.com";
  const checkedAtStr = data.checkedAt
    ? new Date(data.checkedAt).toLocaleString("en-CA", { timeZone: "America/Toronto" })
    : "N/A";

  const blacklistColor =
    data.blacklistStatus === "clear"
      ? "#15803d"
      : data.blacklistStatus === "blacklisted"
      ? "#b91c1c"
      : "#555";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your device blacklist check results</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h1 style="font-size: 22px; color: #111;">iPhone Check — Blacklist Check Receipt</h1>
  <p>Your device blacklist check results are ready. Here is your receipt.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="background: #f5f5f5;">
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd; width: 40%;">Order ID</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${data.orderId}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Date / Time</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${checkedAtStr} (ET)</td>
    </tr>
    <tr style="background: #f5f5f5;">
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Identifier (${data.identifierType.toUpperCase()})</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${data.identifierMasked}</td>
    </tr>
    <tr>
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Data Provider</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${data.providerName ?? "N/A"}</td>
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
      <td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: bold; color: ${blacklistColor};">${formatBlacklistStatus(data.blacklistStatus)}</td>
    </tr>
    ${
      data.providerCoverageNotes
        ? `<tr style="background: #f5f5f5;">
      <td style="padding: 8px 12px; font-weight: bold; border: 1px solid #ddd;">Provider Notes</td>
      <td style="padding: 8px 12px; border: 1px solid #ddd;">${data.providerCoverageNotes}</td>
    </tr>`
        : ""
    }
  </table>

  <div style="background: #f0f4ff; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 13px; color: #555;">
    <strong>Important Notices:</strong>
    <ul style="margin: 8px 0; padding-left: 20px;">
      <li>We return results only from authorized data sources.</li>
      <li>Blacklist coverage depends on the provider and region. Not all carriers report lost or stolen devices immediately.</li>
      <li>Fields showing "Unavailable from provider" were not inferred — they were simply not returned by the provider for this device.</li>
    </ul>
  </div>

  <p>If you have questions, contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>.</p>
  <p style="font-size: 12px; color: #999;">iPhone Check | Results are returned from authorized data sources only.</p>
</body>
</html>`;
}

export async function sendResultEmail(data: ResultEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    logger.warn({ orderId: data.orderId }, "Resend not configured — skipping email send");
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: data.email,
      subject: "Your iPhone blacklist check results",
      html: buildEmailHtml(data),
    });

    if (error) {
      throw new Error(`Resend error: ${JSON.stringify(error)}`);
    }

    logger.info({ orderId: data.orderId, email: data.email }, "Result email sent via Resend");
  } catch (err) {
    logger.error({ err, orderId: data.orderId }, "Failed to send result email");
    throw err;
  }
}
