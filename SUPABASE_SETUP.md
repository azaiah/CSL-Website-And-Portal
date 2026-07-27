# Supabase + Google Auth — CSL Portal setup

Follow these steps once per environment (local + Netlify production).

## 1. Run the database migration

1. Open your Supabase project: **CSL-Temporary-project-database-&-Oauth**
2. Go to **SQL Editor** → **New query**
3. Paste the contents of `supabase/migrations/001_portal_schema.sql`
4. Click **Run**

This creates:

- `profiles` — portal users (linked to Google sign-in)
- `expense_categories` — default P&L categories + room for custom fields
- `expense_entries` — monthly expense amounts
- Row Level Security policies

## 2. Enable Google in Supabase

1. Supabase → **Authentication** → **Providers** → **Google**
2. Enable Google
3. Copy the **Callback URL** shown (looks like  
   `https://YOUR_PROJECT.supabase.co/auth/v1/callback`)

## 3. Create Google OAuth credentials

1. [Google Cloud Console](https://console.cloud.google.com) → create/select project
2. **APIs & Services** → **OAuth consent screen** → External → fill app name + support email
3. **Credentials** → **Create OAuth client ID** → **Web application**
4. **Authorized redirect URIs** — add the Supabase callback URL from step 2
5. Copy **Client ID** and **Client Secret** into Supabase Google provider settings → Save

## 4. Configure redirect URLs in Supabase

Supabase → **Authentication** → **URL Configuration**:

| Field | Value |
|---|---|
| **Site URL** | `https://trustcsl.com` |
| **Redirect URLs** | `http://localhost:3000/portal/auth/callback` |
| | `http://localhost:3001/portal/auth/callback` |
| | `https://trustcsl.com/portal/auth/callback` |
| | `https://csl-website-portal-active.netlify.app/portal/auth/callback` |

## 5. Environment variables

Copy `.env.example` to `.env.local` (local) and add the same keys in **Netlify → Environment variables**.

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PORTAL_ALLOWED_EMAILS=capitalsolutionslogistics@gmail.com,azaiah@dataisdata.com,tony@dataisdata.com
```

Find URL + anon key in Supabase → **Project Settings** → **API**.

**Never commit `.env.local` or service role keys to GitHub.**

## 6. Test locally

```bash
npm run dev
```

Open `http://localhost:3000/portal` → **Continue with Google**.

## 7. Redeploy Netlify

After adding env vars, trigger a new deploy so production picks them up.

## Allowed emails & roles

Only these accounts can sign in (unless you override via env):

| Email | Role | Access |
|---|---|---|
| `capitalsolutionslogistics@gmail.com` | **Owner** | Full portal — Darren's daily use |
| `azaiah@dataisdata.com` | **Admin** | Full portal — tech support |
| `tony@dataisdata.com` | **Admin** | Full portal — dataisdata team |

**Viewer** role (for future staff): Dashboard, Company Brain, and Settings only — no AI Team, Pipeline, Opportunities, Documents, or Weekly Report. You can preview Viewer mode from the Admin account via **Preview role** in the user menu.

To add a staff member later, add their email to `PORTAL_ALLOWED_EMAILS` — they default to **Viewer** unless mapped in `lib/auth/config.ts`.

## Troubleshooting

| Issue | Fix |
|---|---|
| Redirect loop | Check Site URL + redirect URLs in Supabase |
| Unauthorized after Google | Add that Gmail to `PORTAL_ALLOWED_EMAILS` |
| Profile errors | Re-run SQL migration in Supabase SQL Editor |
| SSL on trustcsl.com pending | Wait for Netlify HTTPS (separate from auth) |
