import { Module } from "@nestjs/common";
import { DonationsController } from "./donations.controller";
import { DonationsService } from "./donations.service";
import { StripeProvider } from "./stripe.provider";
import { PaystackProvider } from "./paystack.provider";

@Module({
  controllers: [DonationsController],
  providers: [DonationsService, StripeProvider, PaystackProvider],
})
export class DonationsModule {}
