import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";

/**
 * S3-compatible object storage (MinIO in local dev). Uploads media and returns a public URL.
 * On boot, ensures the bucket exists and is publicly readable so <img src> works directly.
 */
@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket = process.env.S3_BUCKET ?? "ibiblia-media";
  private readonly publicUrl =
    process.env.S3_PUBLIC_URL ?? `${process.env.S3_ENDPOINT ?? "http://localhost:9002"}/${this.bucket}`;
  private readonly client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: process.env.S3_REGION ?? "us-east-1",
      endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9002",
      forcePathStyle: true, // required for MinIO
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "minioadmin",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "minioadmin",
      },
    });
  }

  async onModuleInit(): Promise<void> {
    // In production without storage configured, skip bucket setup so the API boots instantly.
    if (!process.env.S3_ENDPOINT) {
      this.logger.warn("Object storage not configured (S3_ENDPOINT unset) — image uploads disabled.");
      return;
    }
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        this.logger.log(`Created bucket "${this.bucket}"`);
      } catch (err) {
        this.logger.warn(`Could not create bucket "${this.bucket}": ${(err as Error).message}`);
        return;
      }
    }
    // Allow anonymous read so uploaded images are viewable by URL.
    try {
      await this.client.send(
        new PutBucketPolicyCommand({
          Bucket: this.bucket,
          Policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Principal: { AWS: ["*"] },
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${this.bucket}/*`],
              },
            ],
          }),
        })
      );
    } catch (err) {
      this.logger.warn(`Could not set public policy: ${(err as Error).message}`);
    }
  }

  async upload(file: {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
  }): Promise<{ key: string; url: string }> {
    const ext = file.originalname.includes(".") ? file.originalname.split(".").pop() : "bin";
    const key = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return { key, url: `${this.publicUrl}/${key}` };
  }
}
