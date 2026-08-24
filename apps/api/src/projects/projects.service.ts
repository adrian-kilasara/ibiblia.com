import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProjectDto, ListProjectsQuery, UpdateProjectDto } from "./dto";

const include = { language: true, country: true } satisfies Prisma.ProjectInclude;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  list(query: ListProjectsQuery) {
    const where: Prisma.ProjectWhereInput = {
      status: query.status,
      languageId: query.languageId,
      countryId: query.countryId,
      featured: query.featured,
    };
    return this.prisma.project.findMany({
      where,
      include,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    });
  }

  async bySlug(slug: string) {
    const project = await this.prisma.project.findUnique({ where: { slug }, include });
    if (!project) throw new NotFoundException(`Project "${slug}" not found`);
    return project;
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto, include });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.ensureExists(id);
    return this.prisma.project.update({ where: { id }, data: dto, include });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.project.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureExists(id: string): Promise<void> {
    const found = await this.prisma.project.findUnique({ where: { id }, select: { id: true } });
    if (!found) throw new NotFoundException(`Project ${id} not found`);
  }
}
