import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { SubmissionType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

class CreateSubmissionDto {
  @IsEnum(SubmissionType) type!: SubmissionType;
  @IsOptional() @IsString() @MaxLength(200) name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MaxLength(50) phone?: string;
  @IsOptional() @IsString() @MaxLength(200) subject?: string;
  @IsOptional() @IsString() @MaxLength(5000) message?: string;
  @IsOptional() @IsObject() payload?: Record<string, unknown>;
}

/** Public endpoint for inbound forms (newsletter, contact, volunteer, partner, prayer). */
@ApiTags("submissions")
@Controller("submissions")
export class SubmissionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() dto: CreateSubmissionDto): Promise<{ ok: true }> {
    await this.prisma.submission.create({
      data: {
        type: dto.type,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        subject: dto.subject,
        message: dto.message,
        payload: dto.payload ? (dto.payload as object) : undefined,
      },
    });
    return { ok: true };
  }
}
