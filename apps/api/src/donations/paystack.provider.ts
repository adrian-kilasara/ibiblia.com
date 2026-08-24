import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  CheckoutRequest,
  CheckoutResult,
  PaymentProvider,
  WebhookResult,
} from "./payment-provider.interface";

/**
 * Paystack — pan-African gateway (cards + mobile money). Implements one-time charges via the
 * Transaction Initialize API. Recurring (monthly) requires a Paystack Plan; until a plan is
 * configured, monthly gifts are processed as a one-time charge (logged), keeping the flow live.
 */
@Injectable()
export class PaystackProvider implements PaymentProvider {
  readonly name = "PAYSTACK" as const;
  private readonly logger = new Logger(PaystackProvider.name);
  private readonly secret = process.env.PAYSTACK_SECRET_KEY;
  private readonly base = "https://api.paystack.co";

  isConfigured(): boolean {
    return Boolean(this.secret);
  }

  async createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
    if (!this.secret) throw new ServiceUnavailableException("Paystack is not configured");
    if (req.interval === "MONTHLY") {
      this.logger.warn("Paystack recurring requires a Plan; processing as one-time for now.");
    }

    const res = await fetch(`${this.base}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: req.donorEmail,
        amount: req.amount, // minor units
        currency: req.currency,
        callback_url: req.successUrl,
        metadata: { donationId: req.donationId, designation: req.designation },
      }),
    });

    const json = (await res.json()) as {
      status: boolean;
      message: string;
      data?: { authorization_url: string; reference: string };
    };
    if (!res.ok || !json.status || !json.data) {
      throw new ServiceUnavailableException(json.message ?? "Paystack init failed");
    }
    return { url: json.data.authorization_url, providerRef: json.data.reference };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<WebhookResult> {
    if (!this.secret) throw new ServiceUnavailableException("Paystack webhook not configured");

    const expected = createHmac("sha512", this.secret).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signature ?? "");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { status: "IGNORED" };
    }

    const event = JSON.parse(rawBody.toString("utf8")) as {
      event: string;
      data: { reference: string; metadata?: { donationId?: string } };
    };

    if (event.event === "charge.success") {
      return {
        donationId: event.data.metadata?.donationId,
        providerRef: event.data.reference,
        status: "SUCCEEDED",
      };
    }
    return { status: "IGNORED" };
  }
}
