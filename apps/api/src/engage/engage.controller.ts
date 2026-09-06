import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { PrismaService } from "../prisma/prisma.service";

class SubscribeDto {
  @IsEmail() email!: string;
  @IsOptional() @IsString() @MaxLength(120) name?: string;
}

class QuestionDto {
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(2) @MaxLength(5000) message!: string;
  /** When true, also subscribe the asker so we can email them the answer. */
  @IsOptional() @IsBoolean() subscribe?: boolean;
}

/** Public endpoints: subscribe to updates, and ask a question / leave a comment. */
@ApiTags("engage")
@Controller()
export class EngageController {
  constructor(private readonly prisma: PrismaService) {}

  @Post("subscribe")
  async subscribe(@Body() dto: SubscribeDto): Promise<{ ok: true }> {
    const email = dto.email.trim().toLowerCase();
    await this.prisma.subscriber.upsert({
      where: { email },
      create: { email, name: dto.name?.trim() || null },
      update: { name: dto.name?.trim() || undefined },
    });
    return { ok: true };
  }

  @Post("questions")
  async ask(@Body() dto: QuestionDto): Promise<{ ok: true }> {
    const email = dto.email.trim().toLowerCase();
    await this.prisma.question.create({
      data: { email, name: dto.name?.trim() || null, message: dto.message.trim() },
    });
    if (dto.subscribe) {
      await this.prisma.subscriber.upsert({
        where: { email },
        create: { email, name: dto.name?.trim() || null },
        update: {},
      });
    }
    return { ok: true };
  }
}
