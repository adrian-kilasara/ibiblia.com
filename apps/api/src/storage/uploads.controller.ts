import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { Express } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "./storage.service";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/;

@ApiTags("uploads")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin/uploads")
export class UploadsController {
  constructor(
    private readonly storage: StorageService,
    private readonly prisma: PrismaService
  ) {}

  /** The gallery: previously uploaded assets, newest first. */
  @Get()
  gallery() {
    return this.prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  }

  /** Upload a local image; returns the stored asset (with a public URL). */
  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_BYTES } }))
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file provided");
    if (!ALLOWED.test(file.mimetype)) {
      throw new BadRequestException("Only image files are allowed");
    }

    const { key, url } = await this.storage.upload(file);
    return this.prisma.mediaAsset.create({
      data: { key, url, mimeType: file.mimetype, size: file.size, alt: file.originalname },
    });
  }
}
