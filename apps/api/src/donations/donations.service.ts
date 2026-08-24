import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { DonationProvider, DonationStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { StripeProvider } from "./stripe.provider";
import { PaystackProvider } from "./paystack.provider";
import type { PaymentProvider } from "./payment-provider.interface";
import { CheckoutDto } from "./dto";
import { sendDonationReceipt } from "./receipts";

@Injectable()
export class DonationsService {
  private readonly logger = new Logger(DonationsService.name);
  private readonly providers: Record<DonationProvider, PaymentProvider>;

  constructor(
    private readonly prisma: PrismaService,
    stripe: StripeProvider,
    paystack: PaystackProvider
  ) {
    this.providers = {
      STRIPE: stripe,
      PAYSTACK: paystack,
      // Flutterwave adapter can be added here later; interface is identical.
      FLUTTERWAVE: paystack,
    };
  }

  private provider(name: DonationProvider): PaymentProvider {
    return this.providers[name];
  }

  /** Create a pending Donation and a hosted-checkout URL to redirect the donor to. */
  async checkout(dto: CheckoutDto): Promise<{ url: string }> {
    const provider = this.provider(dto.provider);
    if (!provider.isConfigured()) {
      throw new BadRequestException(
        `${dto.provider} payments are not yet available. Please try another method.`
      );
    }

    const currency = (dto.currency ?? "USD").toUpperCase();
    const donation = await this.prisma.donation.create({
      data: {
        amount: dto.amount,
        currency,
        provider: dto.provider,
        interval: dto.interval,
        designation: dto.designation,
        donorEmail: dto.donorEmail,
        donorName: dto.donorName,
        status: "PENDING",
      },
    });

    const webUrl = process.env.WEB_URL ?? "http://localhost:3200";
    const result = await provider.createCheckout({
      donationId: donation.id,
      amount: dto.amount,
      currency,
      interval: dto.interval,
      designation: dto.designation,
      donorEmail: dto.donorEmail,
      successUrl: `${webUrl}/donate/thank-you`,
      cancelUrl: `${webUrl}/donate`,
    });

    await this.prisma.donation.update({
      where: { id: donation.id },
      data: { providerRef: result.providerRef },
    });

    return { url: result.url };
  }

  /** Process a verified webhook: flip the Donation status and email a receipt on success. */
  async handleWebhook(
    providerName: DonationProvider,
    rawBody: Buffer,
    signature: string
  ): Promise<{ received: true }> {
    const provider = this.provider(providerName);
    const result = await provider.handleWebhook(rawBody, signature);
    if (result.status === "IGNORED") return { received: true };

    const donation = result.donationId
      ? await this.prisma.donation.findUnique({ where: { id: result.donationId } })
      : result.providerRef
        ? await this.prisma.donation.findFirst({ where: { providerRef: result.providerRef } })
        : null;

    if (!donation) {
      this.logger.warn(`Webhook for unknown donation (ref=${result.providerRef})`);
      return { received: true };
    }

    const status: DonationStatus = result.status === "SUCCEEDED" ? "SUCCEEDED" : "FAILED";
    await this.prisma.donation.update({ where: { id: donation.id }, data: { status } });

    if (status === "SUCCEEDED" && donation.donorEmail) {
      await sendDonationReceipt({
        email: donation.donorEmail,
        amount: donation.amount,
        currency: donation.currency,
        designation: donation.designation,
      });
    }

    return { received: true };
  }
}
