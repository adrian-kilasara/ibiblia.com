import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreatePublicationDto,
  ListPublicationsQuery,
  UpdatePublicationDto,
} from "./dto";

const include = { language: true } satisfies Prisma.PublicationInclude;

@Injectable()
export class PublicationsService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: ListPublicationsQuery) {
    const where: Prisma.PublicationWhereInput = {
      published: true,
      category: query.category,
      languageId: query.languageId,
      featured: query.featured,
    };
    return this.prisma.publication.findMany({
      where,
      include,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });
  }

  async bySlug(slug: string) {
    const pub = await this.prisma.publication.findUnique({ where: { slug }, include });
    if (!pub) throw new NotFoundException(`Publication "${slug}" not found`);
    return pub;
  }

  create(dto: CreatePublicationDto) {
    return this.prisma.publication.create({ data: dto, include });
  }

  async update(id: string, dto: UpdatePublicationDto) {
    await this.ensureExists(id);
    return this.prisma.publication.update({ where: { id }, data: dto, include });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.publication.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureExists(id: string): Promise<void> {
    const found = await this.prisma.publication.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!found) throw new NotFoundException(`Publication ${id} not found`);
  }
}
