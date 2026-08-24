import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { PublicationCategory, PublicationFormat } from "@prisma/client";

export class CreatePublicationDto {
  @IsString() slug!: string;
  @IsString() title!: string;
  @IsEnum(PublicationCategory) category!: PublicationCategory;

  @IsOptional() @IsString() author?: string;
  @IsOptional() @IsString() languageId?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() coverImageUrl?: string;
  @IsOptional() @IsString() downloadUrl?: string;
  @IsOptional() @IsString() previewUrl?: string;

  @IsOptional() @IsArray() @IsEnum(PublicationFormat, { each: true })
  formats?: PublicationFormat[];

  @IsOptional() @IsInt() @Min(0) price?: number;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}

export class UpdatePublicationDto extends CreatePublicationDto {
  @IsOptional() @IsString() declare slug: string;
  @IsOptional() @IsString() declare title: string;
  @IsOptional() @IsEnum(PublicationCategory) declare category: PublicationCategory;
}

export class ListPublicationsQuery {
  @IsOptional() @IsEnum(PublicationCategory) category?: PublicationCategory;
  @IsOptional() @IsString() languageId?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
}
