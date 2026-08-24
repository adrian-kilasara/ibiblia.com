import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { ProjectStatus } from "@prisma/client";

export class CreateProjectDto {
  @IsString() slug!: string;
  @IsString() title!: string;
  @IsString() summary!: string;

  @IsOptional() @IsString() body?: string;
  @IsOptional() @IsString() languageId?: string;
  @IsOptional() @IsString() countryId?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() team?: string;
  @IsOptional() @IsString() coverImageUrl?: string;

  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;

  @IsOptional() @IsInt() @Min(0) @Max(100) progressPct?: number;
  @IsOptional() @IsInt() @Min(0) fundingNeeded?: number;
  @IsOptional() @IsInt() @Min(0) fundingRaised?: number;

  @IsOptional() @IsArray() @IsString({ each: true }) gallery?: string[];
  @IsOptional() @IsBoolean() featured?: boolean;
}

export class UpdateProjectDto extends CreateProjectDto {
  @IsOptional() @IsString() declare slug: string;
  @IsOptional() @IsString() declare title: string;
  @IsOptional() @IsString() declare summary: string;
}

export class ListProjectsQuery {
  @IsOptional() @IsEnum(ProjectStatus) status?: ProjectStatus;
  @IsOptional() @IsString() languageId?: string;
  @IsOptional() @IsString() countryId?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
}
