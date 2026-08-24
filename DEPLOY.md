# Deploying iBiblia for free

This hosts the whole thing at **no cost**:

| Piece | Free host | What it is |
|---|---|---|
| Database | **Neon** | Postgres (free, permanent) |
| API (NestJS) | **Render** | the backend + admin API |
| Public site (`apps/web`) | **Vercel** | the website people see |
| Admin CMS (`apps/admin`) | **Vercel** | where you manage content |
| Images (optional) | **Cloudflare R2** | upload storage |

You'll need free accounts on **GitHub**, **Neon**, **Render**, and **Vercel** (sign in to all of them with GitHub to keep it simple).

> ⏱️ First time takes ~30–40 minutes. After that, every `git push` redeploys automatically.

---

## Step 0 — Put the code on GitHub

The hosts deploy from a GitHub repo, so push the project there first.

1. Create a new **empty** repo on GitHub (e.g. `ibiblia`), no README.
2. In the project folder, run:

```bash
git init
git add .
git commit -m "iBiblia initial"
git branch -M main
git remote add origin https://github.com/<your-username>/ibiblia.git
git push -u origin main
```

`.env` files are git-ignored, so no secrets are pushed. Good.

---

## Step 1 — Database on Neon (Postgres)

1. Go to **neon.tech** → sign up → **Create project**. Name it `ibiblia`, pick the region closest to you.
2. On the project dashboard, click **Connection string** and copy the **`psql`/`Prisma`** URL. It looks like:
   `postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/ibiblia?sslmode=require`
3. **Keep this string** — it's your `DATABASE_URL`. (The `?sslmode=require` at the end is required.)

---

## Step 2 — API on Render

**Option A — Blueprint (fastest):** the repo already has `render.yaml`.

1. **render.com** → **New +** → **Blueprint** → connect your GitHub repo → **Apply**.
2. Render creates the `ibiblia-api` service. Open it → **Environment** → set:
   - `DATABASE_URL` = your Neon string from Step 1
   - `WEB_URL` = leave blank for now (you'll set it after Step 3)
   - (`JWT_SECRET` is auto-generated.)
3. Click **Manual Deploy → Deploy latest commit**.

**Option B — Manual (if you prefer):** New + → **Web Service** → connect repo, then:
- **Root Directory:** *(leave blank)*
- **Runtime:** Node · **Plan:** Free
- **Build Command:** `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @ibiblia/api build`
- **Start Command:** `pnpm --filter @ibiblia/api start:prod`
- **Health Check Path:** `/api/health`
- **Environment:** add `DATABASE_URL`, `JWT_SECRET` (any long random text), `WEB_URL` (blank for now), and `NODE_VERSION` = `20`.

The start command runs database migrations automatically on every deploy.

When it finishes, your API is at **`https://ibiblia-api.onrender.com`** (your exact URL is shown at the top of the service). Test it: open **`https://ibiblia-api.onrender.com/api/health`** → you should see `{"status":"ok","db":"up"}`.

> 💤 **Free-tier note:** Render's free API "sleeps" after ~15 min of no traffic and takes ~30–50s to wake on the next visit. Fine for a demo. To avoid this later, upgrade the service or use **Koyeb**/**Fly.io** (see bottom).

---

## Step 3 — Seed the first data + admin login

The database has empty tables. Run the seed **once** to create the admin user and starter content. Do this from your computer, pointed at Neon:

```bash
# in the project folder — use YOUR Neon URL:
DATABASE_URL="postgresql://...neon.tech/ibiblia?sslmode=require" pnpm --filter @ibiblia/api db:seed
```

On Windows PowerShell:

```powershell
$env:DATABASE_URL="postgresql://...neon.tech/ibiblia?sslmode=require"; pnpm --filter @ibiblia/api db:seed
```

This creates the admin account **`admin@ibiblia.com` / `changeme123`** (change the password later) and placeholder content. Run it only once — it clears content tables each time.

---

## Step 4 — Public site on Vercel

1. **vercel.com** → **Add New… → Project** → import your GitHub repo.
2. **Configure:**
   - **Root Directory:** `apps/web`  ← important
   - Framework Preset: **Next.js** (auto-detected)
   - **Environment Variables:** add
     `NEXT_PUBLIC_API_URL` = `https://ibiblia-api.onrender.com` (your Render URL)
3. **Deploy.** You'll get a URL like **`https://ibiblia.vercel.app`** — that's your live website. 🎉

---

## Step 5 — Admin CMS on Vercel

Repeat Step 4 for the admin, as a **second** Vercel project:

1. **Add New… → Project** → import the **same** repo again.
2. **Root Directory:** `apps/admin`
3. **Environment Variable:** `NEXT_PUBLIC_API_URL` = your Render API URL (same as above).
4. **Deploy** → you get e.g. **`https://ibiblia-admin.vercel.app`**. Log in with the admin account from Step 3.

---

## Step 6 — Connect the pieces

1. Back in **Render → ibiblia-api → Environment**, set `WEB_URL` to your site URL from Step 4 (e.g. `https://ibiblia.vercel.app`) and save (it redeploys).
2. Visit your site — content loads from the API. (If a page looks empty on the very first visit, the Render API was asleep; refresh after ~30s.)

**You're live.** Manage everything from the admin site; edits appear on the public site within a minute.

---

## Optional — Image uploads (Cloudflare R2, free 10 GB)

Without this, the site still works (image fields just stay empty). To enable admin image uploads:

1. **Cloudflare** → **R2** → **Create bucket** named `ibiblia-media`.
2. Bucket → **Settings** → enable **Public access** (R2.dev subdomain). Copy the public URL (e.g. `https://pub-xxxx.r2.dev`).
3. **R2 → Manage API Tokens** → create a token with **Object Read & Write**. Copy the Access Key ID and Secret.
4. In **Render → ibiblia-api → Environment**, add:
   - `S3_ENDPOINT` = `https://<your-account-id>.r2.cloudflarestorage.com`
   - `S3_REGION` = `auto`
   - `S3_BUCKET` = `ibiblia-media`
   - `S3_ACCESS_KEY_ID` = *(your R2 key)*
   - `S3_SECRET_ACCESS_KEY` = *(your R2 secret)*
   - `S3_PUBLIC_URL` = the public bucket URL from step 2
5. Save (redeploys). Image **Upload** in the admin now works.

---

## Updating the site later

Just push to GitHub:

```bash
git add .
git commit -m "update content/design"
git push
```

Render and both Vercel projects redeploy automatically. Database schema changes are applied on the API's next deploy (via `prisma migrate deploy`).

---

## Alternative to Vercel — host the site + admin on Render

If Vercel gives you trouble, you can host the two Next.js apps on **Render** too (same place as the API). For **each** app create a **Web Service**:

**Public site:**
- **Root Directory:** *(leave blank)*
- **Build Command:** `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @ibiblia/web build`
- **Start Command:** `pnpm --filter @ibiblia/web start`
- **Environment:** `NEXT_PUBLIC_API_URL` = your API URL, `NODE_VERSION` = `20`
- Plan: Free

**Admin:** identical, but swap `@ibiblia/web` → `@ibiblia/admin` in both commands.

(The `next start` scripts read the host's `PORT` automatically.) You'll get URLs like `ibiblia-web.onrender.com` and `ibiblia-admin.onrender.com`.

### Or Netlify
Netlify also works: **Add new site → Import** the repo → set **Base directory** to `apps/web` (and a second site with `apps/admin`), add `NEXT_PUBLIC_API_URL`, deploy. Netlify auto-installs its Next.js plugin.

## Free alternatives (if Render's sleep bothers you)

- **Koyeb** (free instance that stays awake): create a Web Service from the repo, same build/start commands as Step 2.
- **Fly.io** (free allowance, needs a card on file): `fly launch` in `apps/api`.
- **Database** could also be **Supabase** (free Postgres) instead of Neon — same idea, copy its connection string into `DATABASE_URL`.
