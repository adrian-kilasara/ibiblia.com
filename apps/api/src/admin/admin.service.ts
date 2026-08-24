import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RESOURCES, ResourceConfig } from "./resource-registry";

// Prisma model delegates share this shape; we access them dynamically by name.
interface Delegate {
  findMany(args?: unknown): Promise<unknown[]>;
  findUnique(args: unknown): Promise<unknown | null>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
  count(args?: unknown): Promise<number>;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private config(resource: string): ResourceConfig {
    const cfg = RESOURCES[resource];
    if (!cfg) throw new NotFoundException(`Unknown resource "${resource}"`);
    return cfg;
  }

  private model(cfg: ResourceConfig): Delegate {
    return (this.prisma as unknown as Record<string, Delegate>)[cfg.delegate];
  }

  list(resource: string) {
    const cfg = this.config(resource);
    return this.model(cfg).findMany({ orderBy: cfg.orderBy, include: cfg.include });
  }

  async counts(): Promise<Record<string, number>> {
    const entries = await Promise.all(
      Object.entries(RESOURCES).map(async ([slug, cfg]) => {
        const n = await this.model(cfg).count();
        return [slug, n] as const;
      })
    );
    return Object.fromEntries(entries);
  }

  async get(resource: string, id: string) {
    const cfg = this.config(resource);
    const row = await this.model(cfg).findUnique({ where: { id }, include: cfg.include });
    if (!row) throw new NotFoundException(`${resource} ${id} not found`);
    return row;
  }

  create(resource: string, data: Record<string, unknown>) {
    const cfg = this.config(resource);
    if (cfg.readOnly) throw new ForbiddenException(`${resource} is read-only`);
    return this.model(cfg).create({ data: this.clean(data), include: cfg.include });
  }

  async update(resource: string, id: string, data: Record<string, unknown>) {
    const cfg = this.config(resource);
    if (cfg.readOnly) throw new ForbiddenException(`${resource} is read-only`);
    await this.get(resource, id);
    return this.model(cfg).update({
      where: { id },
      data: this.clean(data),
      include: cfg.include,
    });
  }

  async remove(resource: string, id: string) {
    const cfg = this.config(resource);
    if (cfg.readOnly) throw new ForbiddenException(`${resource} is read-only`);
    await this.get(resource, id);
    await this.model(cfg).delete({ where: { id } });
    return { deleted: true };
  }

  /** Strip fields the client must never set directly. */
  private clean(data: Record<string, unknown>): Record<string, unknown> {
    if (typeof data !== "object" || data === null) {
      throw new BadRequestException("Body must be an object");
    }
    const { id, createdAt, updatedAt, ...rest } = data;
    void id;
    void createdAt;
    void updatedAt;
    return rest;
  }
}
