import type { DonationInterval } from "@prisma/client";

export interface CheckoutRequest {
  donationId: string;
  amount: number; // cents
  currency: string;
  interval: DonationInterval;
  designation: string;
  donorEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  /** Hosted checkout URL to redirect the donor to. */
  url: string;
  /** Provider-side reference (session/transaction id) to reconcile via webhook. */
  providerRef: string;
}

export interface WebhookResult {
  /** Our Donation id, resolved from provider metadata/reference. */
  donationId?: string;
  providerRef?: string;
  status: "SUCCEEDED" | "FAILED" | "IGNORED";
}

/** A payment gateway. Stripe and Paystack both implement this so they're interchangeable. */
export interface PaymentProvider {
  readonly name: "STRIPE" | "PAYSTACK";
  /** True when the required secret keys are present. */
  isConfigured(): boolean;
  createCheckout(req: CheckoutRequest): Promise<CheckoutResult>;
  /** Verify the raw webhook payload + signature and map it to our donation. */
  handleWebhook(rawBody: Buffer, signature: string): Promise<WebhookResult>;
}
