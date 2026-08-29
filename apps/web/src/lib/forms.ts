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
