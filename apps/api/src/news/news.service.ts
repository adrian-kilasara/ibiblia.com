import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateNewsDto, UpdateNewsDto } from "./dto";

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  list(limit?: number) {
    return this.prisma.newsPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  }

  async bySlug(slug: string) {
    const post = await this.prisma.newsPost.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException(`Article "${slug}" not found`);
    return post;
  }

  create(dto: CreateNewsDto) {
    const { publishedAt, ...rest } = dto;
    return this.prisma.newsPost.create({
      data: { ...rest, ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {}) },
    });
  }

  async update(id: string, dto: UpdateNewsDto) {
    await this.ensureExists(id);
    const { publishedAt, ...rest } = dto;
    return this.prisma.newsPost.update({
      where: { id },
      data: { ...rest, ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {}) },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.newsPost.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureExists(id: string): Promise<void> {
    const found = await this.prisma.newsPost.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) throw new NotFoundException(`Article ${id} not found`);
  }
}
