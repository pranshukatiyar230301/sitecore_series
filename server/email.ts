import sgMail from "@sendgrid/mail";

const TO = process.env.CONTACT_RECEIVER_EMAIL || "pranshukatiyar230301@gmail.com";

export async function sendContactEmail(payload: { name: string; email: string; message: string }) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEnv = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey) {
    console.warn("[email] SENDGRID_API_KEY not set — skipping email send. Submission saved to DB only.");
    return { sent: false, reason: "no_api_key" };
  }
  if (!fromEnv) {
    console.warn("[email] SENDGRID_FROM_EMAIL not set — skipping email send. Submission saved to DB only.");
    return { sent: false, reason: "no_from_email" };
  }

  sgMail.setApiKey(apiKey);
  const subject = `New SitecoreSeries contact: ${payload.name}`;
  const text = `Name: ${payload.name}\nEmail: ${payload.email}\n\nMessage:\n${payload.message}`;
  
  const html = `
    <h2 style="font-family:sans-serif">New contact form submission</h2>
    <table style="font-family:sans-serif;border-collapse:collapse">
      <tr><td style="padding:6px 12px;font-weight:bold">Name</td><td style="padding:6px 12px">${escapeHtml(payload.name)}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold">Email</td><td style="padding:6px 12px"><a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></td></tr>
    </table>
    <h3 style="font-family:sans-serif;margin-top:24px">Message</h3>
    <div style="font-family:sans-serif;white-space:pre-wrap;background:#f6f6f6;padding:14px;border-radius:8px">${escapeHtml(payload.message)}</div>
  `;

  try {
    const [response] = await sgMail.send({
      to: TO,
      from: fromEnv,
      replyTo: payload.email,
      subject,
      text,
      html,
    });

    // SendGrid returns 202 Accepted on success
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return { sent: true };
    } else {
      console.error("[email] Unexpected SendGrid status:", response.statusCode);
      return { sent: false, reason: "unexpected_status", status: response.statusCode };
    }
  } catch (e: any) {
    // Safely extract SendGrid's detailed error body if available
    const errorBody = e?.response?.body || e?.message || e;
    console.error("[email] SendGrid send failed:", JSON.stringify(errorBody, null, 2));
    return { sent: false, reason: "send_failed", error: e?.message };
  }
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as any)[c]);
}