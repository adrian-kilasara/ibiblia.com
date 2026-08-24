import { Logger } from "@nestjs/common";

const logger = new Logger("Receipts");

/** Send a donation receipt via Resend if configured; otherwise no-op (logged). */
export async function sendDonationReceipt(params: {
  email: string;
  amount: number; // cents
  currency: string;
  designation: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM ?? "iBiblia <no-reply@ibiblia.com>";
  const amount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: params.currency,
  }).format(params.amount / 100);

  if (!apiKey) {
    logger.log(`(receipt skipped — no RESEND_API_KEY) ${amount} to ${params.email}`);
    return;
  }

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: params.email,
        subject: "Thank you for your gift to iBiblia",
        html: `<p>Thank you for your generous gift of <strong>${amount}</strong> toward
               <strong>${params.designation}</strong>.</p>
               <p>Your support puts Scripture into the hands of people still waiting to read it in
               their own language.</p>
               <p>— iBiblia</p>`,
      }),
    });
  } catch (err) {
    logger.error(`Failed to send receipt: ${(err as Error).message}`);
  }
}
