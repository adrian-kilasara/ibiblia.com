import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import type { Express, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "./storage.service";

const MAX_BYTES = 64 * 1024 * 1024; // 64MB — covers images, PDFs, and short videos.
// Images, PDFs, and common web video types. Large/long videos should use a YouTube/Vimeo link.
const ALLOWED = /^(image\/(png|jpe?g|webp|gif|svg\+xml)|application\/pdf|video\/(mp4|webm|ogg|quicktime))$/;

// Never ship the raw `data` buffer back in JSON responses — only metadata.
const ASSET_SELECT = {
  id: true,
  key: true,
  url: true,
  mimeType: true,
  size: true,
  alt: true,
  createdAt: true,
} as const;

/** Build the API's public base URL (e.g. https://ibiblia-api.onrender.com) from the request. */
function publicBase(req: Request): string {
  if (process.env.API_PUBLIC_URL) return process.env.API_PUBLIC_URL.replace(/\/$/, "");
  const proto = ((req.headers["x-forwarded-proto"] as string) || req.protocol || "https").split(",")[0];
  const host = (req.headers["x-forwarded-host"] as string) || req.headers.host;
  return `${proto}://${host}`;
}

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
    return this.prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: ASSET_SELECT,
    });
  }

  /** Upload a local image; returns the stored asset (with a public URL). */
  @Post()
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_BYTES } }))
  async upload(@Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file provided");
    if (!ALLOWED.test(file.mimetype)) {
      throw new BadRequestException("Only images, PDFs, and videos are allowed");
    }

    // Preferred path: external S3/R2 object storage, when configured.
    if (this.storage.isConfigured()) {
      const { key, url } = await this.storage.upload(file);
      return this.prisma.mediaAsset.create({
        data: { key, url, mimeType: file.mimetype, size: file.size, alt: file.originalname },
        select: ASSET_SELECT,
      });
    }

    // Fallback (no storage configured): keep the bytes in the database and serve them from the API.
    // The public URL points back at GET /api/uploads/:id below.
    const key = `db/${new Date().getFullYear()}/${randomUUID()}`;
    const asset = await this.prisma.mediaAsset.create({
      data: {
        key,
        url: "", // filled in below once we know the id
        mimeType: file.mimetype,
        size: file.size,
        alt: file.originalname,
        data: file.buffer,
      },
      select: { id: true },
    });
    const url = `${publicBase(req)}/api/uploads/${asset.id}`;
    return this.prisma.mediaAsset.update({
      where: { id: asset.id },
      data: { url },
      select: ASSET_SELECT,
    });
  }

  /** Remove a file from the gallery. */
  @Delete(":id")
  async remove(@Param("id") id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id }, select: { id: true } });
    if (!asset) throw new NotFoundException("File not found");
    await this.prisma.mediaAsset.delete({ where: { id } });
    return { deleted: true };
  }
}

/** Publicly serves DB-stored file bytes so <img>/<video>/PDF links work without external storage. */
@ApiTags("uploads")
@Controller("uploads")
export class PublicUploadsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(":id")
  async serve(@Param("id") id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    const asset = await this.prisma.mediaAsset.findUnique({
      where: { id },
      select: { mimeType: true, data: true },
    });
    if (!asset || !asset.data) throw new NotFoundException("File not found");

    const buf = Buffer.from(asset.data);
    res.setHeader("Content-Type", asset.mimeType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.setHeader("Accept-Ranges", "bytes");
    // PDFs and images display inline in the browser rather than downloading.
    res.setHeader("Content-Disposition", "inline");

    // Honour HTTP Range requests so <video> can stream and seek.
    const range = req.headers.range;
    const match = range ? /bytes=(\d*)-(\d*)/.exec(range) : null;
    if (match) {
      let start = match[1] ? parseInt(match[1], 10) : 0;
      let end = match[2] ? parseInt(match[2], 10) : buf.length - 1;
      if (Number.isNaN(start)) start = 0;
      if (Number.isNaN(end) || end >= buf.length) end = buf.length - 1;
      if (start > end || start >= buf.length) {
        res.status(416).setHeader("Content-Range", `bytes */${buf.length}`);
        res.end();
        return;
      }
      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${buf.length}`);
      res.setHeader("Content-Length", String(end - start + 1));
      res.end(buf.subarray(start, end + 1));
      return;
    }

    res.setHeader("Content-Length", String(buf.length));
    res.end(buf);
  }
}
