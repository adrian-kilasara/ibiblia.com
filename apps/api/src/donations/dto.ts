import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import {
  DonationDesignation,
  DonationInterval,
  DonationProvider,
} from "@prisma/client";

export class CheckoutDto {
  @IsInt() @Min(100) amount!: number; // cents; min $1.00

  @IsOptional() @IsString() currency?: string;
  @IsEnum(DonationInterval) interval!: DonationInterval;
  @IsEnum(DonationDesignation) designation!: DonationDesignation;
  @IsEnum(DonationProvider) provider!: DonationProvider;

  @IsEmail() donorEmail!: string;
  @IsOptional() @IsString() donorName?: string;
}
