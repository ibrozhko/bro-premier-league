# BPL Predict setup

## football-data.org API key

Create a free API key at football-data.org and add it as:

```text
FOOTBALL_DATA_API_KEY
```

Do not put the real key into source code. For local testing, copy `.env.example` to `.env.local` and fill in:

```text
FOOTBALL_DATA_API_KEY=...
PREDICT_SUPABASE_URL=...
PREDICT_SUPABASE_SERVICE_ROLE_KEY=...
CRON_SECRET=...
```

For production on Vercel, add the same variables in:

```text
Project Settings -> Environment Variables
```

## Sync endpoint

The endpoint is:

```text
/api/predict-sync-results
```

It calls:

```text
GET https://api.football-data.org/v4/competitions/WC/matches
Header: X-Auth-Token: FOOTBALL_DATA_API_KEY
```

Vercel Hobby supports cron jobs once per day, so production currently runs it daily via `vercel.json`:

```json
{
  "path": "/api/predict-sync-results",
  "schedule": "0 6 * * *"
}
```

On a Vercel Pro plan, this can be changed back to every 5 minutes:

```json
{
  "path": "/api/predict-sync-results",
  "schedule": "*/5 * * * *"
}
```

If `CRON_SECRET` is set, manual calls must include:

```text
Authorization: Bearer YOUR_CRON_SECRET
```

## Database

Run the schema in:

```text
supabase/predict.sql
```

To create the first admin/test user, run:

```text
supabase/predict_seed_ihor.sql
```

This creates:

```text
username: ihor
password: demo2026
invite code: BPL-IHOR
```

The sync endpoint expects the `predict_matches.external_id` field to match football-data.org match IDs.
