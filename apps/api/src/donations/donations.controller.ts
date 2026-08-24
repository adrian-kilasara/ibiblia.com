import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { RawBodyRequest } from "@nestjs/common";
import type { Request } from "express";
import { DonationsService } from "./donations.service";
import { CheckoutDto } from "./dto";

@ApiTags("donations")
@Controller("donations")
export class DonationsController {
  constructor(private readonly donations: DonationsService) {}

  /** Public: create a donation + hosted checkout session, returns { url } to redirect to. */
  @Post("checkout")
  checkout(@Body() dto: CheckoutDto) {
    return this.donations.checkout(dto);
  }

  @Post("webhook/stripe")
  stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string
  ) {
    return this.donations.handleWebhook("STRIPE", req.rawBody ?? Buffer.from(""), signature);
  }

  @Post("webhook/paystack")
  paystackWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("x-paystack-signature") signature: string
  ) {
    return this.donations.handleWebhook("PAYSTACK", req.rawBody ?? Buffer.from(""), signature);
  }
}
