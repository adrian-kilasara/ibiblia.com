import type { IconType } from "react-icons";
import { FaPhone, FaWhatsapp, FaXTwitter, FaInstagram, FaFacebookF, FaThreads } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";

type Info = {
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  x?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  threads?: string | null;
};

/** Normalise a social value to a full URL (accepts a bare handle or a full link). */
function socialUrl(base: string, value: string): string {
  const v = value.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, "");
  return `${base}${handle}`;
}

/** Themed contact/social icons. Each renders only when its field is filled; icons inherit the
 *  site's colours (currentColor) rather than the brands' original colours. */
export function SocialLinks({ info, className = "" }: { info: Info; className?: string }) {
  const links: { key: string; label: string; Icon: IconType; href: string }[] = [];

  if (info.phone)
    links.push({ key: "phone", label: "Phone", Icon: FaPhone, href: `tel:${info.phone.replace(/[^\d+]/g, "")}` });
  if (info.whatsapp)
    links.push({
      key: "whatsapp",
      label: "WhatsApp",
      Icon: FaWhatsapp,
      href: `https://wa.me/${info.whatsapp.replace(/[^\d]/g, "")}`,
    });
  if (info.email)
    links.push({ key: "email", label: "Email", Icon: SiGmail, href: `mailto:${info.email}` });
  if (info.x) links.push({ key: "x", label: "X", Icon: FaXTwitter, href: socialUrl("https://x.com/", info.x) });
  if (info.instagram)
    links.push({
      key: "instagram",
      label: "Instagram",
      Icon: FaInstagram,
      href: socialUrl("https://instagram.com/", info.instagram),
    });
  if (info.facebook)
    links.push({ key: "facebook", label: "Facebook", Icon: FaFacebookF, href: socialUrl("https://facebook.com/", info.facebook) });
  if (info.threads)
    links.push({ key: "threads", label: "Threads", Icon: FaThreads, href: socialUrl("https://threads.net/@", info.threads) });

  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      {links.map(({ key, label, Icon, href }) => (
        <a
          key={key}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={label}
          title={label}
          className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <Icon className="size-[18px]" aria-hidden />
        </a>
      ))}
    </div>
  );
}
