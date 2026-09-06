import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { RESOURCES, ResourceConfig } from "./resource-registry";

/**
 * Per-model set of non-nullable scalar/enum fields (keyed by lowercased model name).
 * The admin form sends `null` for untouched fields; for a NOT-NULL column that would make
 * Prisma throw (a 500). Dropping the key instead lets the column's default apply on create
 * and the existing value stay put on update, while nullable fields can still be cleared.
 */
const REQUIRED_FIELDS: Record<string, Set<string>> = {};
for (const model of Prisma.dmmf.datamodel.models) {
  const set = new Set<string>();
  for (const f of model.fields) {
    if (f.isRequired && !f.isList && f.kind !== "object") set.add(f.name);
  }
  REQUIRED_FIELDS[model.name.toLowerCase()] = set;
}

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
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

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

  async create(resource: string, data: Record<string, unknown>) {
    const cfg = this.config(resource);
    if (cfg.readOnly || cfg.noCreate) throw new ForbiddenException(`${resource} cannot be created here`);
    const payload = this.clean(cfg, data);
    if (cfg.delegate === "question" && payload.answer) payload.answeredAt = new Date();
    const row = (await this.model(cfg).create({ data: payload, include: cfg.include })) as Record<string, unknown>;
    await this.afterWrite(cfg, row, null);
    return row;
  }

  async update(resource: string, id: string, data: Record<string, unknown>) {
    const cfg = this.config(resource);
    if (cfg.readOnly) throw new ForbiddenException(`${resource} is read-only`);
    const before = (await this.get(resource, id)) as Record<string, unknown>;
    const payload = this.clean(cfg, data);
    if (cfg.delegate === "question" && payload.answer && !before.answeredAt) payload.answeredAt = new Date();
    const row = (await this.model(cfg).update({
      where: { id },
      data: payload,
      include: cfg.include,
    })) as Record<string, unknown>;
    await this.afterWrite(cfg, row, before);
    return row;
  }

  /** Fire email side-effects after a write (answer to asker; news to subscribers). Never throws. */
  private async afterWrite(
    cfg: ResourceConfig,
    row: Record<string, unknown>,
    before: Record<string, unknown> | null
  ): Promise<void> {
    try {
      if (cfg.delegate === "question" && row.answer && !(before && before.answer)) {
        await this.mail.sendAnswer(row as { name?: string | null; email: string; message: string; answer?: string | null });
      }
      if (cfg.delegate === "newsPost" && row.published && !row.notifiedAt) {
        await this.mail.notifyNews(row as { id: string; slug: string; title: string; excerpt?: string | null });
        await this.prisma.newsPost.update({ where: { id: row.id as string }, data: { notifiedAt: new Date() } });
      }
    } catch (err) {
      this.logger.warn(`afterWrite side-effect failed: ${(err as Error).message}`);
    }
  }

  async remove(resource: string, id: string) {
    const cfg = this.config(resource);
    if (cfg.readOnly) throw new ForbiddenException(`${resource} is read-only`);
    await this.get(resource, id);
    await this.model(cfg).delete({ where: { id } });
    return { deleted: true };
  }

  /**
   * Strip fields the client must never set directly, and drop `null`/`undefined` for
   * non-nullable columns so their defaults (create) or existing values (update) apply
   * instead of Prisma throwing on a NOT-NULL violation.
   */
  private clean(cfg: ResourceConfig, data: Record<string, unknown>): Record<string, unknown> {
    if (typeof data !== "object" || data === null) {
      throw new BadRequestException("Body must be an object");
    }
    const { id, createdAt, updatedAt, ...rest } = data;
    void id;
    void createdAt;
    void updatedAt;

    const required = REQUIRED_FIELDS[cfg.delegate.toLowerCase()] ?? new Set<string>();
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rest)) {
      if ((value === null || value === undefined) && required.has(key)) continue;
      out[key] = value;
    }
    return out;
  }
}
