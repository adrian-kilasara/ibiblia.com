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
import heicConvert = require("heic-convert");
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "./storage.service";

const MAX_BYTES = 64 * 1024 * 1024; // 64MB — covers images, PDFs, and short videos.
// Images, PDFs, and common web video types. Large/long videos should use a YouTube/Vimeo link.
const ALLOWED = /^(image\/(png|jpe?g|webp|gif|svg\+xml)|application\/pdf|video\/(mp4|webm|ogg|quicktime))$/;

// iPhone photos are HEIC/HEIF, which desktop browsers can't display — detect and convert to JPEG.
const HEIC_BRANDS = ["heic", "heix", "hevc", "hevx", "mif1", "msf1", "heim", "heis", "hevm", "hevs"];
function isHeic(buffer: Buffer, mimetype: string, name: string): boolean {
  if (/hei[cf]/i.test(mimetype)) return true;
  if (/\.hei[cf]$/i.test(name)) return true;
  if (buffer.length > 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    return HEIC_BRANDS.includes(buffer.toString("ascii", 8, 12).toLowerCase());
  }
  return false;
}

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

    // Normalise the upload; convert HEIC/HEIF (iPhone) photos to JPEG so browsers can show them.
    let buffer = file.buffer;
    let mimetype = file.mimetype;
    let filename = file.originalname;
    if (isHeic(buffer, mimetype, filename)) {
      try {
        buffer = Buffer.from(await heicConvert({ buffer, format: "JPEG", quality: 0.9 }));
        mimetype = "image/jpeg";
        filename = filename.replace(/\.[^.]+$/, "") + ".jpg";
      } catch {
        throw new BadRequestException("Could not process this HEIC photo. Please try a JPG or PNG.");
      }
    }

    if (!ALLOWED.test(mimetype)) {
      throw new BadRequestException("Only images, PDFs, and videos are allowed");
    }

    // Preferred path: external S3/R2 object storage, when configured.
    if (this.storage.isConfigured()) {
      const { key, url } = await this.storage.upload({
        originalname: filename,
        mimetype,
        buffer,
        size: buffer.length,
      });
      return this.prisma.mediaAsset.create({
        data: { key, url, mimeType: mimetype, size: buffer.length, alt: filename },
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
        mimeType: mimetype,
        size: buffer.length,
        alt: filename,
        data: buffer,
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
