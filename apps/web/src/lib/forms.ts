/** Client-side form submission to the public API. */
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4400";
const API_URL = /^https?:\/\//.test(RAW_API_URL) ? RAW_API_URL : `https://${RAW_API_URL}`;

export type SubmissionType = "VOLUNTEER" | "PARTNER" | "CONTACT" | "PRAYER" | "NEWSLETTER";

export interface SubmissionInput {
  type: SubmissionType;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  payload?: Record<string, unknown>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** POST JSON to the API, retrying through a sleeping free-tier API's cold-start window. */
async function postJson(path: string, body: unknown): Promise<void> {
  let res: Response | undefined;
  const maxAttempts = 15;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      res = await fetch(`${API_URL}/api${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if ([502, 503, 504].includes(res.status) && attempt < maxAttempts - 1) {
        await wait(4000);
        continue;
      }
      break;
    } catch {
      if (attempt < maxAttempts - 1) {
        await wait(4000);
        continue;
      }
      throw new Error("Couldn't reach the server. Please try again in a moment.");
    }
  }
  if (!res) throw new Error("Couldn't reach the server. Please try again in a moment.");
  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const b = (await res.json()) as { message?: string | string[] };
      if (b.message) message = Array.isArray(b.message) ? b.message.join(", ") : b.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
}

/** Subscribe an email to news updates. */
export function subscribe(input: { email: string; name?: string }): Promise<void> {
  return postJson("/subscribe", input);
}

/** Ask a question / leave a comment; optionally subscribe so the answer can be emailed. */
export function askQuestion(input: {
  name?: string;
  email: string;
  message: string;
  subscribe?: boolean;
}): Promise<void> {
  return postJson("/questions", input);
}

export async function postSubmission(input: SubmissionInput): Promise<void> {
  // Wait out a sleeping free-tier API instead of failing instantly.
  let res: Response | undefined;
  const maxAttempts = 15;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      res = await fetch(`${API_URL}/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if ([502, 503, 504].includes(res.status) && attempt < maxAttempts - 1) {
        await wait(4000);
        continue;
      }
      break;
    } catch (err) {
      if (attempt < maxAttempts - 1) {
        await wait(4000);
        continue;
      }
      throw new Error("Couldn't reach the server. Please try again in a moment.");
    }
  }
  if (!res) throw new Error("Couldn't reach the server. Please try again in a moment.");
  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (body.message) message = Array.isArray(body.message) ? body.message.join(", ") : body.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
}
