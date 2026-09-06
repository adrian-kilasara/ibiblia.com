import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type NewsLike = { id: string; slug: string; title: string; excerpt?: string | null };
type QuestionLike = { name?: string | null; email: string; message: string; answer?: string | null };

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

/**
 * Sends transactional email via Resend's HTTP API. If RESEND_API_KEY is not set it safely
 * no-ops (logging what it would have sent), so the rest of the app works before email is wired.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly key = process.env.RESEND_API_KEY;
  private readonly from = process.env.MAIL_FROM ?? "iBiblia <onboarding@resend.dev>";
  private readonly siteUrl = (process.env.SITE_URL ?? "https://ibiblia-web.onrender.com").replace(/\/$/, "");

  constructor(private readonly prisma: PrismaService) {}

  isConfigured(): boolean {
    return Boolean(this.key);
  }

  private async send(opts: { to: string; bcc?: string[]; subject: string; html: string }): Promise<void> {
    if (!this.key) {
      this.logger.warn(
        `Email NOT sent (RESEND_API_KEY unset): "${opts.subject}" → to=${opts.to}${
          opts.bcc?.length ? ` bcc=${opts.bcc.length}` : ""
        }`
      );
      return;
    }
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: this.from, to: [opts.to], bcc: opts.bcc, subject: opts.subject, html: opts.html }),
      });
      if (!res.ok) this.logger.warn(`Resend ${res.status}: ${await res.text()}`);
    } catch (err) {
      this.logger.warn(`Email error: ${(err as Error).message}`);
    }
  }

  /** Email the asker their answer — but only if they subscribed. */
  async sendAnswer(q: QuestionLike): Promise<void> {
    if (!q.answer) return;
    const sub = await this.prisma.subscriber.findUnique({ where: { email: q.email } });
    if (!sub) {
      this.logger.log(`Answer recorded for ${q.email} (not a subscriber — not emailed).`);
      return;
    }
    const html = `
      <p>Hello${q.name ? " " + esc(q.name) : ""},</p>
      <p>Thank you for reaching out to iBiblia. Here is the answer to your message.</p>
      <p style="color:#555"><em>You wrote:</em><br>${esc(q.message)}</p>
      <p><strong>Our reply:</strong><br>${esc(q.answer).replace(/\n/g, "<br>")}</p>
      <p>— iBiblia · The Word for All</p>`;
    await this.send({ to: q.email, subject: "iBiblia has answered your message", html });
  }

  /** Email all subscribers about a newly published news post (BCC in batches, addresses hidden). */
  async notifyNews(post: NewsLike): Promise<void> {
    const subs = await this.prisma.subscriber.findMany({ select: { email: true } });
    if (subs.length === 0) return;
    const url = `${this.siteUrl}/news/${post.slug}`;
    const html = `
      <p>New from iBiblia:</p>
      <h2 style="margin:8px 0">${esc(post.title)}</h2>
      ${post.excerpt ? `<p>${esc(post.excerpt)}</p>` : ""}
      <p><a href="${url}">Read it on the website →</a></p>
      <p style="color:#888;font-size:12px">You're receiving this because you subscribed to iBiblia updates.</p>`;
    const emails = subs.map((s) => s.email);
    for (let i = 0; i < emails.length; i += 45) {
      await this.send({ to: this.from, bcc: emails.slice(i, i + 45), subject: `iBiblia: ${post.title}`, html });
    }
    this.logger.log(`News "${post.title}" emailed to ${emails.length} subscriber(s).`);
  }
}
