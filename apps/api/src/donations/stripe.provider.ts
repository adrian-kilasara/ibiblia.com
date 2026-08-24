import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import Stripe from "stripe";
import type {
  CheckoutRequest,
  CheckoutResult,
  PaymentProvider,
  WebhookResult,
} from "./payment-provider.interface";

@Injectable()
export class StripeProvider implements PaymentProvider {
  readonly name = "STRIPE" as const;
  private readonly logger = new Logger(StripeProvider.name);
  private readonly client: Stripe | null;
  private readonly webhookSecret: string | undefined;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    this.client = key ? new Stripe(key) : null;
    if (!this.client) this.logger.warn("Stripe not configured (STRIPE_SECRET_KEY missing).");
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
    if (!this.client) throw new ServiceUnavailableException("Stripe is not configured");

    const recurring = req.interval === "MONTHLY";
    const session = await this.client.checkout.sessions.create({
      mode: recurring ? "subscription" : "payment",
      customer_email: req.donorEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: req.currency.toLowerCase(),
            unit_amount: req.amount,
            product_data: { name: `iBiblia Donation — ${req.designation}` },
            ...(recurring ? { recurring: { interval: "month" } } : {}),
          },
        },
      ],
      metadata: { donationId: req.donationId, designation: req.designation },
      success_url: req.successUrl,
      cancel_url: req.cancelUrl,
    });

    return { url: session.url ?? "", providerRef: session.id };
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<WebhookResult> {
    if (!this.client || !this.webhookSecret) {
      throw new ServiceUnavailableException("Stripe webhook not configured");
    }
    const event = this.client.webhooks.constructEvent(rawBody, signature, this.webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          donationId: session.metadata?.donationId,
          providerRef: session.id,
          status: session.payment_status === "paid" || session.status === "complete"
            ? "SUCCEEDED"
            : "IGNORED",
        };
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return { donationId: session.metadata?.donationId, providerRef: session.id, status: "FAILED" };
      }
      default:
        return { status: "IGNORED" };
    }
  }
}
