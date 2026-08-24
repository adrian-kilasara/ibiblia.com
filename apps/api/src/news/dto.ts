import { IsBoolean, IsDateString, IsOptional, IsString } from "class-validator";

export class CreateNewsDto {
  @IsString() slug!: string;
  @IsString() title!: string;
  @IsString() body!: string;

  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsBoolean() published?: boolean;
  @IsOptional() @IsDateString() publishedAt?: string;
}

export class UpdateNewsDto extends CreateNewsDto {
  @IsOptional() @IsString() declare slug: string;
  @IsOptional() @IsString() declare title: string;
  @IsOptional() @IsString() declare body: string;
}
