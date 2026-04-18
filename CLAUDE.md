# CLAUDE.md — Maison Adari Command Center
> Read this first. Every session. No exceptions.

## IDENTITY
- Live: https://project-3tj6u.vercel.app
- GitHub: https://github.com/MasonMargiela/maison-adari-command-center
- Local: /Users/user/maison-adari-command-center
- Supabase: https://qljltgkkuhcbizaeiylt.supabase.co

## STACK
Next.js 16.2.3, TypeScript, Vercel hobby, Supabase, Instagram Graph API (live), TikTok (sandbox)

## ENV VARS (Vercel only)
INSTAGRAM_APP_ID=925060730351923
INSTAGRAM_REDIRECT_URI=https://project-3tj6u.vercel.app/api/callback/instagram
NEXT_PUBLIC_SUPABASE_URL=https://qljltgkkuhcbizaeiylt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=(Vercel only)
CRON_SECRET=maison-adari-cron-2026
NEXT_PUBLIC_BASE_URL=https://project-3tj6u.vercel.app
TIKTOK_CLIENT_KEY=sbawg0qygdx4gb0lmo
TIKTOK_REDIRECT_URI=https://project-3tj6u.vercel.app/api/callback/tiktok
INSTAGRAM_ACCESS_TOKEN = DEAD. Token lives in Supabase only. Never read from env.

## SUPABASE
Tables: connected_accounts, metric_snapshots
Unique constraint: (platform, username) — check-then-insert NOT upsert
Live accounts:
  masondoesnumbers     instagram  client_id=mason  id=1c879360-eed3-493c-b79e-5d6ee927d9dd
  pilatesforbettersex  instagram  client_id=mason  id=91f19290-...
Real data: 352 followers Mar 19 -> 369 Apr 17 2026 (+17)
Backfill: https://project-3tj6u.vercel.app/api/sync/instagram/backfill?t=N

## API ROUTES
/api/accounts/[clientId]         fetch accounts by client_id
/api/callback/instagram          OAuth callback -> Supabase
/api/callback/tiktok
/api/connect/instagram           starts IG OAuth
/api/connect/instagram/save      check-then-insert (NO upsert, NO cookie)
/api/connect/tiktok
/api/cron/refresh-token          weekly Sunday 3am UTC
/api/cron/sync
/api/debug
/api/invite
/api/sync/instagram              reads token FROM Supabase
/api/sync/instagram/backfill     30-day historical backfill
/api/sync/instagram/history      follower history for graph
/api/sync/instagram/insights
/api/sync/tiktok                 stub

## PAGES
app/page.tsx               2997 lines — full dashboard
app/connect/page.tsx        399 lines — connect accounts
app/connect/select/page.tsx 236 lines — account selector
app/connect/invite/page.tsx 256 lines — personalized invite

## DASHBOARD TABS
Overview, Mason, Macros Wit Matt, Globe(stub), Live(stub), Spots, Trends, Competitors, Prospects, Revenue, AFE, Clients

## KEY COMPONENTS (app/page.tsx)
PeriodPill          — sliding pill selector — USE FOR ALL period switchers
FollowerGraph       — SVG line chart with hover slider
PersonCard          — client summary (overview)
UnifiedAccountView  — full account detail (client tabs)
DynamicClientView   — reads accounts from API
Ring, Spark, PieChart, LiveDot

## KEY FUNCTIONS
applyTimePeriodFromHistory(history, periodId)  — USE THIS (real data)
applyTimePeriod(weeklyDelta, periodId)          — fallback multiplier only
calcGainFromHistory(history, days)
TIME_PERIODS = [day, week, month, year]

## DESIGN SYSTEM
P.white=#f8f4ef  P.ink=#1e1a16  P.inkFaint=#b8b0a4  P.sageDeep=#5a9e66  P.roseDeep=#c4849a  P.lavender=#c2aee8
F.display=Fraunces  F.body=DM Sans  F.mono=DM Mono
CSS: .btn-spring .liquid-glass .liquid-glass-dark .period-track/thumb/btn .expand-wrap .shimmer .fade-up
BANNED: .card-lift on account cards (causes layout shift)

## CONNECT PAGE BUTTONS — LOCKED — DO NOT CHANGE
Order: Instagram->TikTok->X->Threads->Snapchat->Kick->Twitch->YouTube
Instagram  rest:#1c1c1e graphite         hover:OLED gradient yellow->purple
TikTok     rest:#010101                  hover:white + glass border
X          rest:#222->#111               hover:#000->#050505
Threads    rest:#333->#111               hover:#101010->#1a1a1a
Snapchat   rest:#1a1a00 white text       hover:#FFFC00 white text glass border
Kick       rest:#0a1a04 green text       hover:#53fc18 white text
Twitch     rest:#6441a5->#9146ff        hover:#bf94ff->#9146ff
YouTube    rest:#ff4444->#FF0000        hover:white bg red text red glass border
Universal border: rgba(255,255,255,0.12) at rest
CSS classes: .connect-btn-ig/tt/x/threads/snap/kick/twitch/yt

## SELECT PAGE
Background #0e0c09, round + button per account, green checkmark on add
SYNCING.LIVE confirmation, sync-all button, check-then-insert save

## FOLLOWER GRAPH
Uses viewBox NOT width attribute (prevents shape-shift bug)
ResizeObserver for sizing
Hover = dashed vertical line + tooltip (date/count/delta)
Green bars=gains Red bars=losses (negative deltas)
Range via PeriodPill: 7d/14d/30d/90d

## RULES — NEVER BREAK
1. Commit to GitHub BEFORE making changes
2. Token always from Supabase never env var
3. Connect button colors = LOCKED get approval before changing
4. No mock labels — show dash not 0/mock/+0
5. Save = check-then-insert not upsert
6. Run backfill after new account connects
7. SVG graph uses viewBox intentional
8. Period switcher = applyTimePeriodFromHistory not multiplier
9. PeriodPill = universal for all selectors sitewide
10. card-lift banned on account cards

## DEPLOY
npm run build && npx vercel --prod
git add . && git commit -m "msg" && git push origin main

## QUICK URLS
Dashboard:    https://project-3tj6u.vercel.app
Connect:      https://project-3tj6u.vercel.app/connect
Mason invite: https://project-3tj6u.vercel.app/connect/invite?invite=mason
IG backfill:  https://project-3tj6u.vercel.app/api/sync/instagram/backfill?t=1
IG history:   https://project-3tj6u.vercel.app/api/sync/instagram/history?days=30
Supabase:     https://qljltgkkuhcbizaeiylt.supabase.co
GitHub:       https://github.com/MasonMargiela/maison-adari-command-center
Vercel:       https://vercel.com/masondavis18287-4671s-projects/project-3tj6u

## PENDING
- Overview PersonCard period switcher: wire igHistory prop fully
- Globe tab: real IG geography
- Live tab: YouTube/Twitch embed
- TikTok prod OAuth: needs maisonadari.com domain
- Matt connecting his accounts
- Reels vs static posts differentiation
- Video length buckets 30s/60s/3min+
- pilatesforbettersex not showing cleanly in Mason tab
