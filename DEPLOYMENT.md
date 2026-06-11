# Deployment

This project can stay on the Vercel Hobby plan by deploying the Next.js app to Vercel and running the follow-up scheduler from GitHub Actions.

## Why Vercel Cron Was Removed

The app previously used a Vercel cron schedule of `*/5 * * * *` for `/api/send-due-followups`. Vercel Hobby only supports daily cron jobs, so the app can fail deployment when the cron runs more frequently than once per day.

## Vercel Setup

1. Import the repository into Vercel.
2. Use the default Next.js settings:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`
3. Add these environment variables in Vercel Project Settings:

```text
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
OPEN_ROUTER_API_KEY
OPENAI_API_KEY
NEXT_PUBLIC_VAPI_VOICE_ASSISTANCE_ID
NEXT_PUBLIC_VAPI_API_KEY
EMAIL_SMTP_HOST
EMAIL_SMTP_PORT
EMAIL_SMTP_USER
EMAIL_SMTP_PASS
EMAIL_FROM
CRON_SECRET
```

`OPENAI_API_KEY` is optional unless you want to use OpenAI moderation. `CRON_SECRET` should be a long random value and must match the GitHub Actions secret with the same name.

## Database Setup

After `DATABASE_URL` is configured, run the migration once:

```bash
npm run build
node scripts/apply_db_migrations.js
```

You can run the migration locally against the Neon production database, or run it from a trusted shell with the same `DATABASE_URL`.

## GitHub Actions Cron Setup

Add these repository secrets in GitHub:

```text
CRON_SECRET=the-same-secret-used-in-vercel
CRON_SEND_FOLLOWUPS_URL=https://your-vercel-domain.vercel.app/api/send-due-followups
```

The workflow in `.github/workflows/send-followups.yml` calls the follow-up endpoint every 5 minutes.

## Manual Cron Test

After deployment, test the endpoint:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-vercel-domain.vercel.app/api/send-due-followups
```

Expected response:

```json
{"success":true,"sent":0}
```
