/**
 * Declarative admin schema. Each resource lists the fields the generic table + form render.
 * Mirrors the Prisma models and the API's resource registry. Add a resource here and it gets
 * a full CRUD screen with no bespoke code.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "money" // integer cents, shown/edited in major units
  | "boolean"
  | "select"
  | "multiselect"
  | "relation"
  | "date"
  | "json"
  | "links" // list of { label, url } rows (PDFs, articles, resources)
  | "blocks" // rich story: ordered text/image/video/links blocks with media inline
  | "file" // URL field with an "upload from computer" button (PDF, video, etc.)
  | "image" // single image: upload / pick from gallery
  | "image-multi"; // multiple images

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  /** For type "relation": the resource slug to pick from. */
  relation?: string;
  /** For type "file": the file input's accept attribute, e.g. "video/*". */
  accept?: string;
  required?: boolean;
  help?: string;
  hideInTable?: boolean;
}

export interface ResourceUi {
  slug: string;
  label: string;
  group: "Content" | "Catalog" | "People" | "Site" | "Inbox";
  titleField: string;
  fields: FieldConfig[];
  readOnly?: boolean;
}

const PROJECT_STATUS = ["UPCOMING", "IN_PROGRESS", "COMPLETED", "NEEDS_FUNDING"];
const PUB_CATEGORY = ["BIBLE", "DEVOTIONAL", "STUDY_GUIDE", "CHILDREN", "MAGAZINE", "AUDIO", "VIDEO"];
const PUB_FORMAT = ["PDF", "EPUB", "AUDIO", "PRINT", "VIDEO"];
const MEDIA_TYPE = ["VIDEO", "PODCAST", "AUDIO"];
const TESTIMONY_ROLE = ["MISSIONARY", "TRANSLATOR", "READER", "PASTOR"];
const MISSION_KEY = ["TRANSLATION", "PUBLISHING", "DIGITAL", "DISTRIBUTION", "INNOVATION"];
const DONATION_STATUS = ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED"];

export const RESOURCES: ResourceUi[] = [
  {
    slug: "impact-stats",
    label: "Impact Stats",
    group: "Content",
    titleField: "label",
    fields: [
      { name: "label", label: "Label", type: "text", required: true },
      { name: "value", label: "Value", type: "number", required: true },
      { name: "suffix", label: "Suffix", type: "text", help: 'e.g. "+"' },
      { name: "order", label: "Order", type: "number" },
    ],
  },
  {
    slug: "mission-areas",
    label: "Mission Areas",
    group: "Content",
    titleField: "title",
    fields: [
      { name: "key", label: "Key", type: "select", options: MISSION_KEY, required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "title", label: "Title", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      {
        name: "content",
        label: "Story Builder",
        type: "blocks",
        hideInTable: true,
        help: "Compose the page with paragraphs, photos, videos, and links in any order. When used, it replaces the Process/Impact/Images/Links sections below.",
      },
      { name: "process", label: "Process (plain — optional)", type: "textarea" },
      { name: "impact", label: "Impact (plain — optional)", type: "textarea" },
      { name: "images", label: "Images", type: "image-multi", hideInTable: true },
      {
        name: "links",
        label: "External Links",
        type: "links",
        hideInTable: true,
        help: "Buttons shown on the page — e.g. an application form or info sheet.",
      },
      { name: "order", label: "Order", type: "number" },
    ],
  },
  {
    slug: "projects",
    label: "Projects",
    group: "Content",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true, help: "One or two sentences shown on cards and at the top of the page." },
      {
        name: "content",
        label: "Story Builder",
        type: "blocks",
        hideInTable: true,
        help: "Compose the page: add paragraphs and drop photos, videos, and links between them, in any order. When used, this replaces the plain body and separate media sections below.",
      },
      {
        name: "body",
        label: "Body (plain — optional)",
        type: "textarea",
        hideInTable: true,
        help: "A simple text-only alternative. Only used if the Story Builder above is empty.",
      },
      { name: "status", label: "Status", type: "select", options: PROJECT_STATUS },
      { name: "progressPct", label: "Progress %", type: "number" },
      { name: "languageId", label: "Language", type: "relation", relation: "languages" },
      { name: "countryId", label: "Country", type: "relation", relation: "countries" },
      { name: "region", label: "Region", type: "text" },
      { name: "team", label: "Team", type: "text", hideInTable: true },
      { name: "fundingNeeded", label: "Funding Needed", type: "money", hideInTable: true },
      { name: "fundingRaised", label: "Funding Raised", type: "money", hideInTable: true },
      { name: "coverImageUrl", label: "Cover Image", type: "image", hideInTable: true },
      {
        name: "gallery",
        label: "Explanatory Pictures",
        type: "image-multi",
        hideInTable: true,
        help: "Extra photos shown in a gallery on the project page.",
      },
      {
        name: "videoUrl",
        label: "Project Video",
        type: "file",
        accept: "video/*",
        hideInTable: true,
        help: "Upload a video from your computer, or paste a YouTube/Vimeo link.",
      },
      {
        name: "links",
        label: "Links & Resources",
        type: "links",
        hideInTable: true,
        help: "PDFs, brochures, articles — each becomes a button on the project page.",
      },
      { name: "featured", label: "Featured", type: "boolean", help: "Show this project on the homepage." },
    ],
  },
  {
    slug: "publications",
    label: "Publications",
    group: "Catalog",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "author", label: "Author", type: "text" },
      { name: "category", label: "Category", type: "select", options: PUB_CATEGORY, required: true },
      { name: "formats", label: "Formats", type: "multiselect", options: PUB_FORMAT },
      { name: "languageId", label: "Language", type: "relation", relation: "languages" },
      {
        name: "content",
        label: "Story Builder",
        type: "blocks",
        hideInTable: true,
        help: "Compose the page with paragraphs, photos, videos, and links in any order. Replaces the plain description when used.",
      },
      { name: "description", label: "Description (plain — optional)", type: "textarea", hideInTable: true, help: "Simple text alternative, used only if the Story Builder is empty." },
      { name: "coverImageUrl", label: "Cover Image", type: "image", hideInTable: true },
      {
        name: "gallery",
        label: "Sample Pages / Photos",
        type: "image-multi",
        hideInTable: true,
        help: "Sample spreads or photos shown in a gallery.",
      },
      {
        name: "videoUrl",
        label: "Video",
        type: "file",
        accept: "video/*",
        hideInTable: true,
        help: "Upload a book trailer, or paste a YouTube/Vimeo link.",
      },
      {
        name: "downloadUrl",
        label: "Download File / URL",
        type: "file",
        accept: "application/pdf,.pdf",
        hideInTable: true,
        help: "Upload a PDF from your computer, or paste a link.",
      },
      {
        name: "previewUrl",
        label: "Preview File / URL",
        type: "file",
        accept: "application/pdf,.pdf",
        hideInTable: true,
        help: "Upload a sample PDF, or paste a link.",
      },
      {
        name: "links",
        label: "Links & Resources",
        type: "links",
        hideInTable: true,
        help: "Sample chapters, reviews, buy pages — each becomes a button.",
      },
      { name: "price", label: "Price", type: "money", hideInTable: true },
      { name: "featured", label: "Featured", type: "boolean" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  {
    slug: "news",
    label: "News",
    group: "Content",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea", help: "Short summary shown on cards and previews." },
      {
        name: "content",
        label: "Story Builder",
        type: "blocks",
        hideInTable: true,
        help: "Compose the article with paragraphs, photos, videos, and links in any order. Replaces the plain body when used.",
      },
      { name: "body", label: "Body (plain)", type: "textarea", hideInTable: true, help: "The full article as plain text. Used if the Story Builder is empty." },
      { name: "category", label: "Category", type: "text" },
      { name: "coverImageUrl", label: "Cover Image", type: "image", hideInTable: true },
      {
        name: "gallery",
        label: "Photos",
        type: "image-multi",
        hideInTable: true,
        help: "Extra photos shown in a gallery in the article.",
      },
      {
        name: "videoUrl",
        label: "Video",
        type: "file",
        accept: "video/*",
        hideInTable: true,
        help: "Upload a video, or paste a YouTube/Vimeo link.",
      },
      {
        name: "links",
        label: "Links & Resources",
        type: "links",
        hideInTable: true,
        help: "Related reports, articles or pages — each becomes a button.",
      },
      { name: "published", label: "Published", type: "boolean" },
      { name: "publishedAt", label: "Published At", type: "date", hideInTable: true },
    ],
  },
  {
    slug: "testimonies",
    label: "Testimonies",
    group: "Content",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "select", options: TESTIMONY_ROLE, required: true },
      { name: "quote", label: "Quote", type: "textarea", required: true, help: "The short pull-quote shown in the slider." },
      { name: "location", label: "Location", type: "text" },
      { name: "photoUrl", label: "Photo", type: "image", hideInTable: true },
      {
        name: "content",
        label: "Story Builder",
        type: "blocks",
        hideInTable: true,
        help: "Optional full story — paragraphs with photos, videos, and links. Adds a 'Read the full story' link and its own page.",
      },
      { name: "order", label: "Order", type: "number" },
    ],
  },
  {
    slug: "media",
    label: "Media",
    group: "Content",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: MEDIA_TYPE, required: true },
      { name: "url", label: "URL", type: "text", required: true },
      { name: "thumbnailUrl", label: "Thumbnail", type: "image", hideInTable: true },
      { name: "description", label: "Description", type: "textarea", hideInTable: true },
    ],
  },
  {
    slug: "team",
    label: "Team",
    group: "People",
    titleField: "name",
    fields: [
      { name: "photoUrl", label: "Photo", type: "image" },
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "bio", label: "Bio", type: "textarea", hideInTable: true },
      { name: "order", label: "Order", type: "number" },
    ],
  },
  {
    slug: "partners",
    label: "Partners",
    group: "People",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "logoUrl", label: "Logo", type: "image" },
      { name: "url", label: "Website", type: "text" },
      { name: "order", label: "Order", type: "number" },
    ],
  },
  {
    slug: "languages",
    label: "Languages",
    group: "Site",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "code", label: "Code", type: "text", required: true },
      { name: "region", label: "Region", type: "text" },
    ],
  },
  {
    slug: "countries",
    label: "Countries",
    group: "Site",
    titleField: "name",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "code", label: "Code", type: "text", required: true },
    ],
  },
  {
    slug: "events",
    label: "Events",
    group: "Content",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", hideInTable: true },
      { name: "startsAt", label: "Starts At", type: "date", required: true },
      { name: "endsAt", label: "Ends At", type: "date" },
      { name: "location", label: "Location", type: "text" },
      { name: "url", label: "URL", type: "text", hideInTable: true },
    ],
  },
  {
    slug: "careers",
    label: "Careers",
    group: "Site",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "type", label: "Type", type: "text" },
      { name: "description", label: "Description", type: "textarea", required: true, hideInTable: true },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  {
    slug: "gallery",
    label: "Gallery",
    group: "Site",
    titleField: "caption",
    fields: [
      { name: "url", label: "Image", type: "image", required: true },
      { name: "caption", label: "Caption", type: "text" },
      { name: "order", label: "Order", type: "number" },
    ],
  },
  {
    slug: "pages",
    label: "Pages",
    group: "Site",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      {
        name: "body",
        label: "Body",
        type: "textarea",
        hideInTable: true,
        help: 'Freeform text. For the "donate" page, put the bank / transfer details here.',
      },
      { name: "blocks", label: "Blocks (JSON)", type: "json", hideInTable: true },
      { name: "seoTitle", label: "SEO Title", type: "text", hideInTable: true },
      { name: "seoDescription", label: "SEO Description", type: "textarea", hideInTable: true },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  {
    slug: "contact-info",
    label: "Contact Info",
    group: "Site",
    titleField: "email",
    fields: [
      { name: "address", label: "Address", type: "textarea" },
      { name: "email", label: "Email", type: "text" },
      { name: "phone", label: "Phone", type: "text" },
      { name: "hours", label: "Hours", type: "text" },
      {
        name: "mapQuery",
        label: "Map Location",
        type: "text",
        help: 'An address or "latitude,longitude" — used to place the map on the website.',
      },
      {
        name: "mapEmbedUrl",
        label: "Map Embed URL (optional)",
        type: "textarea",
        hideInTable: true,
        help: 'Optional. In Google Maps → Share → "Embed a map", copy the src="…" URL and paste it here for an exact pin. Overrides Map Location.',
      },
    ],
  },
  {
    slug: "section-backgrounds",
    label: "Homepage Backgrounds",
    group: "Site",
    titleField: "label",
    fields: [
      { name: "label", label: "Section", type: "text" },
      {
        name: "imageUrl",
        label: "Background Image (3:2)",
        type: "image",
        help: "Uploaded photo blended over this section's colour — subtle at the corners, stronger in the centre. Use a 3:2 landscape image. Leave empty for a plain colour block.",
      },
      { name: "order", label: "Order", type: "number", hideInTable: true },
    ],
  },
  {
    slug: "submissions",
    label: "Submissions",
    group: "Inbox",
    titleField: "email",
    fields: [
      { name: "type", label: "Type", type: "text" },
      { name: "name", label: "Name", type: "text" },
      { name: "email", label: "Email", type: "text" },
      { name: "subject", label: "Subject", type: "text" },
      { name: "message", label: "Message", type: "textarea", hideInTable: true },
      { name: "handled", label: "Handled", type: "boolean" },
    ],
  },
  {
    slug: "donations",
    label: "Donations",
    group: "Inbox",
    titleField: "donorEmail",
    readOnly: true,
    fields: [
      { name: "amount", label: "Amount", type: "money" },
      { name: "currency", label: "Currency", type: "text" },
      { name: "provider", label: "Provider", type: "text" },
      { name: "status", label: "Status", type: "select", options: DONATION_STATUS },
      { name: "designation", label: "Designation", type: "text" },
      { name: "donorEmail", label: "Donor Email", type: "text" },
    ],
  },
];

export function findResource(slug: string): ResourceUi | undefined {
  return RESOURCES.find((r) => r.slug === slug);
}

export const RESOURCE_GROUPS = ["Content", "Catalog", "People", "Site", "Inbox"] as const;
