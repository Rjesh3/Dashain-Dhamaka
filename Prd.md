Dashain Dhamaka — Product Requirements Document
Version 1.0 (Draft for product-owner review) · 10 October 2026 · Market: Nepal · Platform: mobile-first web
Labels used throughout. [CONFIRMED] = stated in the brief. [DEFAULT] = proposed default, changeable. [ASSUMPTION] = needs validation. [OPEN] = needs product-owner decision (see section 23). [REVIEW] = needs legal, ad-policy or security review before launch.
1. Executive summary
Dashain Dhamaka is a free, browser-based, Dashain-themed prize-wheel game. A visitor opens a URL, gets five free spins, spins a wheel, and receives a virtual points reward chosen by the server. Points accumulate in an anonymous, ledger-backed wallet. Players can voluntarily share the game with friends through the Web Share API, WhatsApp, Facebook or copy-link. Revenue comes from third-party display advertising (Monetag, Adsterra or similar), subject to network approval.
Three principles shape every decision:
1. Honesty. Points are virtual entertainment only. No real prize, iPhone, AirPods or cash-out is promised. Decorative device art is labelled as decorative. [CONFIRMED]
2. Server authority. The browser never decides a result, balance or spin count. The animation only plays back what the server already recorded.
3. Low friction, low data. No login, no phone number, no email, no contact access.
Key numbers (verified in section 8): probabilities total 100%; expected value is 273 points per spin and 1,365 points per five-spin session; the chance of at least one 10,000-point result in five spins is about 1.98%; the maximum possible in five spins is 50,000, so the 100,000-point milestone is unreachable with the initial allowance alone (see open decision O-2).
Delivery target: a three-day MVP build (section 20). Ad-network approval, organic traffic and revenue are outside the team's control and may take longer than the build.
2. Product vision and goals
Vision. A polished, reusable festival-game shell that makes Nepali users smile, share a funny result with friends, and come back — without feeling like a low-quality gambling site.
#
Goal
Type
Measure (proposed targets are [ASSUMPTION])
G1
Launch before Dashain peaks
Primary
P0 scope live in production by the agreed date
G2
Attract genuine organic traffic
Primary
Unique visitors, % from referral links
G3
Entertaining, instantly playable
Primary
Play-start rate ≥ 60% of landing views; spin completion ≥ 90% of requested spins
G4
Voluntary sharing
Primary
Share-action rate ≥ 10% of players who finish ≥ 1 spin; referred visits per sharer
G5
Monetise eligible traffic ethically
Primary
Policy-compliant ad impressions; eCPM reported by the network
G6
Low operating cost
Secondary
Monthly infra cost within owner budget (see O-8)
G7
Reusable for later festivals
Secondary
Theme, wheel config and copy driven by configuration, not code
Non-goals. Real prizes, cash-out, paid points, accounts, leaderboards, and any claim that the site will rank or go viral.
3. Problem statement and opportunity
Problem. During Dashain, people exchange greetings and light entertainment on Facebook, TikTok, Messenger and WhatsApp. Many festive "spin and win" pages are misleading (fake prizes, fake counters), slow on weak networks, or force login or ad clicks. Users distrust them.
Opportunity. A fast, transparent, culturally authentic game that is clear it is only for fun, shows results the user can playfully share, and respects the user's data and attention. Trust and polish are the differentiators. [ASSUMPTION: this positioning will resonate; validate through early share rate and qualitative feedback.]
4. Target audience and personas
No demographic statistics are asserted. All persona details are [ASSUMPTION] to be validated with analytics and a few informal user conversations.

P1 — Social-feed Sita
P2 — Casual-game Bikash
P3 — Share-for-laughs Anisha
P4 — Low-data Dipak
P5 — No-account Ramesh
Motivation
Curious link seen on Facebook/TikTok
Enjoys quick casual games
Wants a funny result to post to friends
Wants entertainment without burning data
Dislikes registration and sharing personal data
Device / network
Mid-range Android, mobile data, variable speed
Android, mix of Wi-Fi and data
Android/iOS, WhatsApp-heavy
Low-end Android (≤ 2 GB RAM), 3G/slow 4G, data-capped
Any phone, privacy-minded browser settings
Entry point
Facebook/TikTok in-app browser
Messenger/WhatsApp link
WhatsApp group, Facebook story
Link in WhatsApp
Direct URL or search
Friction
In-app browsers restrict share APIs and storage
Boredom after 5 spins
Share sheet unavailable → needs fallback
Heavy assets, ad weight, long load
Cookies disabled/cleared; wary of ads
Return / share trigger
Friends' funny results; festival timing
Wanting more spins (see O-1)
Rare 10,000 result, shareable card
Page works fast and cheap
Honest rules, no login required
Design implications: the in-app browser must be a first-class target; the share fallback chain is mandatory; page weight is a feature; every state must work without an account.
5. Assumptions and constraints
Constraints [CONFIRMED]: mobile-first; no mandatory login; no unnecessary personal data; server-side game logic; ads must never interfere with gameplay; preferred stack React + Vite, Python + FastAPI, PostgreSQL; Firebase Hosting or similar for static hosting; no provider free tier assumed permanent.
Assumptions [ASSUMPTION]:
• A1. The ad network will approve the site; approval timing is unknown.
• A2. Most traffic arrives via in-app browsers on Android.
• A3. Anonymous identity (cookie/token) is good enough for a fun game with no real value at stake.
• A4. A managed free-tier or low-cost Postgres can handle launch traffic; traffic spikes may require paid tiers.
• A5. Nepali (Devanagari) and English UI are both needed; copy will be supplied or reviewed by a native speaker.
• A6. Because points have no monetary value, abuse has low financial impact, but ad-invalid-traffic risk is real.
Legal / policy items [REVIEW]: whether the experience counts as a lottery or gambling-like activity under Nepali law (no real stake, no real prize is the intended mitigation); privacy-law obligations; ad-network content and traffic policies; consent requirements for ad cookies.
6. Detailed feature requirements
6.1 Homepage and landing (P0)
Must contain: logo/name; one-sentence accurate description; primary Play Now CTA; live wheel preview; points explanation; share entry; link to Game Rules; and a prominent, plain-language notice (body-size text inside the hero or directly under the CTA, not footer-sized): "Dashain Dhamaka is a free virtual game. Points have no cash value and cannot be exchanged for prizes." (also in Nepali). Decorative device imagery, if used, carries an adjacent label "Decorative artwork".
Acceptance: at 360 px width the notice is visible without scrolling past the CTA; its text is ≥ 14 px and meets contrast AA.
6.2 Game, wallet, share, limits, rules (P0)
• Wheel game: seven-segment wheel, server-authoritative result (sections 5-flow and 8).
• Wallet: current points, spins used, spins remaining, last 10 results, one-line explanation.
• Share: modal with native share, WhatsApp, Facebook, copy link, share card; honest confirmations.
• Spin-limit state: friendly "You've used your 5 free spins" screen with wallet total and share option; no pressure, no countdown pretending scarcity.
• Error/offline state: clear message, retry, no lost spin.
• Static pages: Privacy Policy, Terms and Game Rules, About and Contact, Instructions.
• Ads: configuration-controlled placements with placeholders in development (section 15).
6.3 Feature priority
Priority
Items
P0 (launch)
Responsive homepage; wheel; five-spin allowance; server-authoritative outcomes; wallet; anonymous session; basic abuse controls; share links; rules + privacy pages; production deployment; analytics; ad placeholders (live ads only after approval)
P1 (after validation)
Enhanced history; better referral attribution; extra wheel themes; richer analytics; admin config dashboard; possible spin refill/referral reward (needs full spec)
P2 (out of scope)
Registration, cash-out, paid points, crypto, real-world redemption, iPhone-giveaway claims, complex leaderboards, extra social features
7. User stories and acceptance criteria
ID
Story
Acceptance criteria
US-1
As a visitor, I can understand the game in seconds.
Hero text, CTA, notice visible on 360×640 without scrolling beyond first screen + notice; LCP ≤ 2.5 s on mid-range device over throttled 4G (target).
US-2
As a visitor, I get 5 free spins with no login.
First visit creates an anonymous session; state shows spins_remaining = 5, points = 0; no personal data requested.
US-3
As a player, I tap Spin and get a result.
Button disabled while pending; exactly one result; wheel lands on server segment; modal shows points; wallet updates.
US-4
As a player on a bad network, I don't lose a spin.
Retry with same idempotency key returns the original result; failed request leaves spins_remaining unchanged.
US-5
As a player, I refresh and keep my progress.
Reload shows same balance and spins; an in-flight spin is recovered (flow 9.3).
US-6
As a player with 0 spins, I see a clear limit state.
Spin button replaced/disabled with explanation; wallet and share remain usable; API returns 409 NO_SPINS_REMAINING.
US-7
As a player, I can see my recent rewards.
Wallet lists last 10 ledger entries, newest first, with timestamp and points.
US-8
As a player, I can share without being tricked.
Share controls never claim delivery; WhatsApp and Facebook open their share pages; Messenger and Instagram DM use the native share sheet when available and otherwise copy the referral link with app-specific instructions.
US-9
As a friend, I open a shared link and play independently.
Referral landing is recorded once per visit; friend gets own session and 5 spins; no reward to referrer in MVP.
US-10
As a user, I can read the rules and privacy policy.
Linked from footer and homepage; plain language, Nepali + English.
US-11
As a user with reduced-motion setting, I get a non-spinning animation.
prefers-reduced-motion triggers short fade/highlight transition; result still shown.
US-12
As the owner, I can turn ads on/off.
Single config flag; with ads off, containers collapse to zero height or show placeholder per environment.
8. Game mechanics and probability mathematics
8.1 Outcomes and default probabilities [CONFIRMED]
Stored as integer weights out of 10,000 to avoid floating-point error.
Segment
Points
Probability
Weight (/10,000)
Points × probability
Small
10
30.0%
3,000
3.0
Small
100
25.0%
2,500
25.0
Common
200
20.0%
2,000
40.0
Medium
500
12.0%
1,200
60.0
Medium
700
7.0%
700
49.0
High
1,000
5.6%
560
56.0
Grand
10,000
0.4%
40
40.0
Total

100.0%
10,000
273.0
Probability check: 30 + 25 + 20 + 12 + 7 + 5.6 + 0.4 = 100.0. Weight check: 3000 + 2500 + 2000 + 1200 + 700 + 560 + 40 = 10,000.
8.2 Expected value and variability
• Expected points per spin: E[X] = 273.
• Expected points per five-spin session: 5 × 273 = 1,365.
• Second moment: E[X²] = 30 + 2,500 + 8,000 + 30,000 + 34,300 + 56,000 + 400,000 = 530,830.
• Variance per spin: 530,830 − 273² = 530,830 − 74,529 = 456,301; standard deviation ≈ 675.5.
• Five-spin standard deviation: 675.5 × √5 ≈ 1,510.
• P(at least one 10,000 in 5 spins) = 1 − 0.996⁵ ≈ 1.98%.
• Over 500 spins the expected number of grand results is 2; the actual number is random (it can be 0, 1, 3 or more). The system must not force exactly two per 500 spins. [CONFIRMED]
• Range in five spins: minimum 50 points (all 10s); maximum 50,000 (all 10,000s, probability 0.004⁵ ≈ 1.0 × 10⁻¹²).
• Milestone: 100,000 virtual points cannot be reached in five spins. The milestone is a visual progress goal only; whether it is displayed, and how players might ever reach it, is open decision O-2. The UI must not imply it is attainable if it is not.
Theory vs. reality (user-facing copy): "Each spin is random. Averages describe what happens over thousands of spins, not what will happen to you. A big reward is never guaranteed."
8.3 Rules
Rule
Specification
Initial allowance
5 spins per anonymous player session [DEFAULT]. "Eligibility window" = lifetime of the session (30 days sliding from last activity) [DEFAULT, O-1].
Points
Cumulative per anonymous session; stored server-side; frontend is read-only.
Accepted spin
Consumes exactly one spin, creates exactly one spins row and exactly one ledger_entries row.
Failed/unaccepted request
Consumes nothing (transaction rolls back).
Retries
Same Idempotency-Key returns the stored result, never a second reward.
RNG
Python secrets.randbelow(10_000) mapped over cumulative weights; chosen server-side only.
Config changes
Only through a versioned, documented process (migration or admin tool); each spin stores config_version_id; no per-user adjustment, ever.
Value
No cash-out, monetary value, transfer, or redemption. [CONFIRMED]
Randomness disclosure
Rules page lists all outcomes and probabilities.
8.4 Wheel interaction (summary of the 10 steps)
1. Tap Spin → 2. disable button and ignore repeat taps → 3. POST /v1/spins → 4. server validates → 5. server RNG picks outcome → 6. one atomic DB transaction → 7. response is authoritative → 8. animation lands on that segment → 9. result modal → 10. wallet and counter update.
Aspect
Requirement
Animation
~4.0 s ease-out spin, then 0.4 s settle; CSS transform on a single element; no per-frame JS. Animation starts when the response arrives, or starts a slow "anticipation" rotation while pending and then decelerates to the target.
Loading
Button shows spinner and "Spinning…"; wheel slow-rotates.
Pending timeout
Client aborts after 10 s, shows "Checking your spin…", then calls GET /v1/state and retries the same key (once automatically).
Repeated taps
Ignored while pending (state flag) and harmless on the server (idempotency + row lock).
Offline
Detected via request failure/navigator.onLine; shows offline state; nothing consumed; retry button.
Refresh mid-spin
Pending key kept in sessionStorage; on load, client calls GET /v1/state; if a result exists for the key the modal is replayed without re-animating.
Reduced motion
Replace rotation with instant segment highlight and 300 ms fade.
Empty state
0 spins: Spin button disabled, message plus share option.
Fairness copy
Result modal footnote: "Random result. Virtual points only."
9. User flows
9.1 First visit and spin
flowchart TD
  A[Open URL] --> B{Valid session cookie/token?}
  B -- Yes --> C[GET /v1/state]
  B -- No --> D[POST /v1/sessions]
  D --> C
  C --> E[Show wheel, 5 spins, 0 points]
  E --> F[Tap Spin]
  F --> G[POST /v1/spins with Idempotency-Key]
  G -- 200 --> H[Animate to server segment]
  H --> I[Result modal + wallet update]
  G -- 409 no spins --> J[Spin-limit state]
  G -- network error --> K[Retry same key / offline state]
9.2 Share and referral
flowchart LR
  A[Player opens Share modal] --> B{navigator.share available?}
  B -- Yes --> C[Native share sheet]
  B -- No --> D[WhatsApp / Facebook / Copy link]
  C --> E[Record share_initiated]
  D --> E
  E --> F[Friend opens URL with ?r=CODE]
  F --> G[Record referral_landing once per visit]
  G --> H[Friend gets own session, own 5 spins]
9.3 Recovery after refresh or lost response
1. Client stores pending_spin_key in sessionStorage before sending.
2. On load, if a key exists, call GET /v1/state?pending_key=… (or POST /v1/spins with the same key).
3. Server returns the stored result if the spin committed, or processes it if it did not.
4. Client clears the key after displaying or after a definitive error.
10. UX/UI design specification
10.1 Design system
Token
Proposed value [DEFAULT]
Use
Crimson
#9B111E (deep), #7A0C17 (dark)
Header, wheel rim, primary buttons
Gold
#D4A017, #F2C14E
Accents, wheel dividers, result highlights
Cream
#FFF8EC
Page and card surfaces
Marigold
#F28C28
Secondary accent, garlands
Jamara green
#5B8C3A
Small accents only
Ink
#2B1B17
Body text (contrast on cream ≥ 12:1)
• Typography: one display face with Devanagari support (e.g. Noto Serif Devanagari or Yatra One) and Noto Sans / Noto Sans Devanagari for body. Self-host subsets, font-display swap, system fallback stack. Body ≥ 16 px.
• Shape: 16 px card radius, 12 px button radius, soft shadows, 44×44 px minimum touch targets.
• Motifs: tika dot, marigold garland border, jamara sprouts, subtle mandala texture (SVG or WebP, ≤ 20 KB each).
• Avoid: neon glows, flashing lights, slot-machine sounds, countdown timers, "last chance" language.
• Sound: off by default; optional toggle in P1.
10.2 Responsive layouts
Breakpoint
Layout
Small mobile (320–359 px)
Single column; wheel ≤ 88% width; compact wallet strip above wheel; ad slot below the game block
Standard mobile (360–599 px)
Single column; wheel 300–340 px; no sticky bottom bar
Tablet (600–1023 px)
Wheel centred at 420 px; wallet beside or below; two-column info cards
Desktop (≥ 1024 px)
Two columns: wheel left, wallet + rules + share right; max width 1120 px; optional side ad rail
10.3 Screen specifications
#
Screen
Key content and behavior
1
Home/landing
Logo, description, Play Now, wheel preview, points explanation (3 steps), share block, rules link, virtual-entertainment notice
2
Game instructions
Dismissible 3-step sheet: Spin, collect virtual points, share for fun; re-openable via "How it works"
3
Main wheel
Wheel, Spin button, wallet strip (points, spins left), share button, rules link, ad slot outside the control cluster
4
Result modal
Points earned, segment, new total, spins left, "Spin again" or "Share", close. Focus trapped; Esc closes; aria-live announcement
5
Points wallet
Points, spins used/remaining, last 10 results, explanation line; bottom sheet on mobile
6
Share modal
Native share, WhatsApp, Facebook, Copy link, share card preview, honest status text
7
Spin-limit state
"You've used your 5 free spins." Wallet total, share option, rules link, return text consistent with O-1
8
Error/offline
Cause-specific copy (offline, server busy, session expired, rate limited), Retry; "nothing was lost" shown only when true
9
Privacy policy
What is collected, why, retention, cookies, ad-network data, contact
10
Terms and game rules
Outcomes and probabilities, virtual-only statement, no prize, fair play, ad disclosure, change policy
11
About and contact
Who runs it, contact email, feedback, ad-and-data disclosure
Localisation. Nepali and English toggle stored in localStorage; default from Accept-Language, else Nepali; strings in JSON files; native-speaker review before launch.
Share card. Static 1200×630 image for link previews, generic and free of user data, never claiming real prizes. A client-generated result image is P1.
11. Technical architecture
11.1 Recommendations
Topic
Recommendation
Justification
Frontend language
TypeScript
Shared API types prevent contract drift; small cost at this size
Framework
React + Vite, route-level code splitting
Initial JS target ≤ 150 KB gzipped
State
React state and a small context
Presentation only; server is the truth
Styling
Plain CSS with variables or CSS modules
No heavy UI kit
Backend
FastAPI, Pydantic v2, SQLAlchemy 2, Alembic
Standard and quick to build
Database
PostgreSQL on a managed provider (e.g. Neon, Supabase, Render, Railway) [REVIEW current limits]
Transactions, constraints, row locks
Hosting
Static: Firebase Hosting or Cloudflare Pages. API: Render, Railway, Fly.io or similar
No tier assumed permanent; keep Docker portability
Rate limiting
slowapi or middleware backed by Postgres or Redis; in-memory only for one instance
See section 14
Monitoring
Sentry free tier, JSON logs, uptime ping on /healthz

11.2 Architecture diagram
flowchart LR
  U[Player browser] -->|HTTPS static| CDN[Static hosting / CDN]
  U -->|HTTPS JSON, cookie or bearer| API[FastAPI API]
  API --> DB[(PostgreSQL)]
  API --> LOG[Structured logs + Sentry]
  U -.->|ad script, config-gated| ADS[Ad network]
  U -.->|analytics events| API
11.3 Spin sequence
sequenceDiagram
  participant C as Client
  participant A as API
  participant D as PostgreSQL
  C->>A: POST /v1/spins (Idempotency-Key)
  A->>A: Authenticate, rate-limit, validate
  A->>D: BEGIN
  A->>D: SELECT player FOR UPDATE
  A->>D: Existing spin with this key?
  alt exists
    D-->>A: stored result
  else new and spins left
    A->>A: secrets.randbelow(10000) picks outcome
    A->>D: INSERT spin, INSERT ledger, UPDATE player
  else no spins
    A->>D: ROLLBACK
    A-->>C: 409 NO_SPINS_REMAINING
  end
  A->>D: COMMIT
  A-->>C: 200 result + state
  C->>C: Animate to segment, show modal
11.4 Project structure
dashain-dhamaka/
  frontend/
    src/ components/ pages/ i18n/ api/ hooks/ styles/ config/
    public/ robots.txt sitemap.xml og-image.webp fonts/
    index.html  vite.config.ts  .env.example
  backend/
    app/ main.py core/ api/v1/ models/ schemas/ services/ db/
    alembic/  tests/  Dockerfile  pyproject.toml  .env.example
  docs/ PRD.md runbook.md rules-copy/
  .github/workflows/ ci.yml deploy.yml
11.5 Environments and configuration
Variable
Where
Notes
DATABASE_URL
Backend only
Per environment; never committed
SESSION_TOKEN_PEPPER, HMAC_SECRET
Backend only
Hash tokens and IPs
ALLOWED_ORIGINS
Backend
Exact origin list for CORS
SENTRY_DSN
Backend and frontend
Environment-scoped
VITE_API_BASE_URL, VITE_ADS_ENABLED, VITE_AD_PROVIDER, VITE_ANALYTICS_ENABLED
Frontend build
Public values only. No secrets in any VITE_ variable
ENV
Both
development, staging, production
• Local: docker compose up (Postgres), alembic upgrade head, uvicorn app.main:app --reload, npm run dev. Ads off, placeholders on.
• Staging: production-like, separate DB, ads off or sandbox only, noindex.
• Production: ads on only after network approval and consent-flow review.
• Deployment: CI runs lint, type-check and tests; merge to main deploys staging; manual promotion to production; Alembic migrations run pre-deploy and must be backwards-compatible; rollback = redeploy previous image.
• Logging: JSON logs with request ID, route, status, latency, session ID prefix; no raw IP, no tokens.
12. API contract
Base path /v1. JSON only. One error envelope: {"error": {"code": "STRING", "message": "human text", "request_id": "uuid"}}. Only endpoints needed for the MVP are defined.
Method
Path
Purpose
Auth
POST
/v1/sessions
Create or restore anonymous session
None, or existing token
GET
/v1/state
Wallet and config summary
Session
POST
/v1/spins
Perform one spin
Session + Idempotency-Key
GET
/v1/history
Paginated ledger entries
Session
POST
/v1/events
Record whitelisted share/referral events
Session optional
GET
/healthz
Liveness and DB check
None
12.1 POST /v1/sessions
• Request: { "ref": "optional 8-char share code", "locale": "ne|en" }. Unknown fields rejected.
• Behavior: a valid token returns the existing player. Otherwise create a player with spin_limit 5, mint a 256-bit random token, store only its hash, and return it as an HttpOnly, Secure, SameSite=Lax cookie (same-site API subdomain recommended). If cookies are blocked, the body also carries session_token for bearer use from localStorage or memory.
• Response 200/201: { "player": {"public_id", "share_code"}, "state": State }.
• Errors: 400 VALIDATION_ERROR, 429 RATE_LIMITED.
• Rate limit [DEFAULT]: 10 new sessions per hour per IP hash, 60 requests per minute per IP hash. Excess gets a temporary 429, never a permanent ban.
12.2 GET /v1/state
State = { points, spins_used, spins_remaining, spin_limit, config_version, outcomes:[{id,label,points}], last_results:[up to 10] }. Errors: 401 SESSION_INVALID, 429. Limit: 60/min per session.
12.3 POST /v1/spins
• Header: Idempotency-Key: <UUIDv4> (required).
• Body: empty object. The client cannot send points, outcome or spin count.
• Response 200: { "spin": {"id", "outcome_id", "points_awarded", "created_at", "replayed": bool}, "state": State }.
• Idempotency: same key and same session returns the stored result with replayed: true and creates no new ledger row. Uniqueness is on (player_id, idempotency_key).
• Errors: 400 MISSING_IDEMPOTENCY_KEY, 401 SESSION_INVALID, 409 NO_SPINS_REMAINING, 429 RATE_LIMITED (1 accepted spin per second, 30 requests per minute per session), 503 TEMPORARILY_UNAVAILABLE (nothing consumed).
12.4 GET /v1/history?limit=10&cursor=...
limit 1–50 (default 10). Returns { items:[{spin_id, points_delta, balance_after, outcome_label, created_at}], next_cursor } with an opaque keyset cursor. Limit: 30/min per session.
12.5 POST /v1/events
• Request: { "type": "share_clicked|link_copied|referral_landing", "channel": "native|whatsapp|facebook|copy|none", "ref": "optional code", "visit_id": "client UUID" }. Strict enums; unknown values return 400.
• Response: 204.
• Semantics: these are client-reported interaction events, not proof of delivery. referral_landing is deduplicated per (visit_id, ref).
• Limit: 60/min per IP hash.
12.6 GET /healthz
{ "status": "ok", "db": "ok", "version": "git-sha" }. No sensitive data; used by the uptime monitor.
13. Database schema
PostgreSQL. UUID primary keys unless stated; timestamps are timestamptz in UTC.
13.1 players (anonymous sessions)
Column
Type
Notes
id
uuid PK

public_id
text unique
Shown in UI and support; not secret
share_code
text unique, 8 chars
Random; used in ?r=
token_hash
bytea unique
HMAC-SHA-256 of session token
spin_limit
smallint not null default 5
CHECK 0–50
spins_used
smallint not null default 0
CHECK spins_used <= spin_limit
points_balance
bigint not null default 0
CHECK ≥ 0; cache of ledger sum
referred_by_player_id
uuid null, FK players
Attribution only
locale
text
ne or en
created_at, last_seen_at, expires_at
timestamptz
expires_at = last seen + 30 days
Indexes: token_hash, share_code, expires_at. Retention: delete rows expired for 90 days; keep aggregates. Sensitive: no direct PII; token stored only as a hash.
13.2 config_versions
Column
Type
Notes
id
int PK
Version number
outcomes
jsonb
[{id,label,points,weight}]; weights sum to 10,000
initial_spins
smallint
5
is_active
bool
One active row (partial unique index)
created_at, created_by, change_note

Audit trail
Rows are immutable; a change adds a new version. Weight sum validated in code and by test. Retention: permanent.
13.3 spins
Column
Type
Notes
id
uuid PK
Transaction ID
player_id
uuid FK players

spin_number
smallint
1 to spin_limit
idempotency_key
uuid

config_version_id
int FK

outcome_id
text

points_awarded
int

created_at
timestamptz

Unique: (player_id, idempotency_key) and (player_id, spin_number). Index: (player_id, created_at desc). Retention: 12 months, then aggregate.
13.4 ledger_entries
Column
Type
Notes
id
uuid PK

player_id
uuid FK

spin_id
uuid FK, unique
Exactly one entry per spin
entry_type
text
spin_award (only type in MVP)
points_delta
int

balance_after
bigint

created_at
timestamptz

Append-only: the application role has no UPDATE or DELETE grant. Invariant: players.points_balance equals the sum of points_delta, verified by a nightly job.
13.5 campaign_events
Column
Type
Notes
id
bigserial PK

event_type
text
Enum from 12.5
channel
text null

referrer_player_id
uuid null, FK
Resolved from ref
actor_player_id
uuid null, FK

visit_id
uuid
Dedup key
created_at
timestamptz

Unique for referral_landing: (event_type, visit_id, referrer_player_id). Index: (referrer_player_id, event_type, created_at). Retention: 12 months.
13.6 rate_limit_counters and security_log (only where persistence is necessary)
Column
Type
Notes
key
text
e.g. ip:HMAC:minute
window_start
timestamptz

count
int

IPs are stored only as an HMAC with a daily-rotated secret; raw IPs are never persisted. Retention: counters 24 hours; security-incident log 7 days, extended only during an active investigation.
13.7 Atomic commit
One transaction at READ COMMITTED: (1) SELECT the player row FOR UPDATE; (2) look up the idempotency key in spins and return the stored result if found; (3) verify spins_used < spin_limit; (4) choose the outcome; (5) insert the spin with spin_number = spins_used + 1; (6) insert the ledger entry with balance_after; (7) update the player row; (8) commit. The row lock serializes simultaneous requests and the unique constraints are the final safety net. Any exception rolls back everything, so a spin is never consumed without a ledger entry or the reverse.
14. Security and privacy
14.1 Threat model and controls
Threat
Control
Launch
Client-side points manipulation
Server-only balances; the client has no write path
Mandatory
Forged API requests
Session token, schema validation, strict CORS, body limit ≤ 4 KB
Mandatory
Replay and duplicate spins
Idempotency key, unique constraints, row lock
Mandatory
Simultaneous requests
FOR UPDATE lock plus concurrency test
Mandatory
Bots and automated sessions
Per-IP-hash and per-session limits, new-session throttle, header sanity; optional Turnstile or similar challenge only on suspicion
Basic mandatory; challenge when abuse appears
Session token theft
256-bit random token, hashed at rest, HttpOnly Secure cookie, HTTPS and HSTS, no tokens in URLs or logs
Mandatory
SQL injection
ORM or parameterized queries only
Mandatory
Cross-site scripting
React escaping, no dangerouslySetInnerHTML, strict CSP with ad-domain allowlist only when ads are on
Mandatory
CSRF
SameSite=Lax cookie, JSON-only with custom header, Origin check on POST
Mandatory
Referral manipulation
No referral rewards in MVP; dedupe by visit_id; self-referral ignored; reported as visits, not people
Mandatory
Excessive requests
Rate limits, 429 with Retry-After, CDN for static assets
Mandatory
Malicious payloads
Strict Pydantic models, enum events
Mandatory
Secret leakage
Environment variables, secret scanning in CI, .env ignored, no secrets in VITE_ variables
Mandatory
Invalid ad traffic
No click incentives, no ad-click prompts, bot filtering, monitor traffic sources, never self-click
Mandatory
Device fingerprinting
Not used in MVP and never the sole control [DEFAULT]
n/a
Admin dashboard abuse
Out of MVP; if added, SSO plus MFA plus audit log
Later
14.2 Identity limits
Scenario
Behavior
Cleared browser storage
New anonymous session and new 5 spins; old progress is not recoverable (stated in rules)
Private browsing
Session lasts until the private window closes
Different browsers or devices
Separate sessions and balances; no sync in MVP
Cookies disabled
Fall back to in-memory or localStorage bearer token; if both are blocked, show a notice that progress cannot be kept
Expired session (30 days idle)
Treated as a new visitor
Suspicious repeated requests
Escalating temporary 429s, then optional challenge; no permanent bans, and shared IPs (households, carrier NAT) are never banned just for sharing an address
A determined user can obtain extra sessions. Because points have no value, this is tolerated and bounded by the new-session throttle. [ASSUMPTION, REVIEW]
14.3 Privacy
Collected: hashed anonymous session token, game state, event logs, coarse browser class from standard headers, and data collected by the ad network and analytics under their own policies. Not collected: name, phone, email, contacts, precise location. Raw IPs are processed transiently for rate limiting and not stored. A Privacy Policy is required, plus a consent banner for non-essential ad and analytics cookies where required [REVIEW]. Deletion requests are handled by contact email using the player public_id. Analytics and ad scripts load only after consent where the review says it is needed.
15. Advertising and monetization
15.1 Placements
Slot
Where
Reserved size
Notes
A1 Mobile banner
Below the game block and wallet; never adjacent to Spin or Share (≥ 48 px gap, bordered, labelled "Advertisement")
320×100 or 300×250
min-height reserved to prevent layout shift
A2 Native/in-content
Landing page between explanation and share block
100% × 250

A3 Desktop rail
≥ 1024 px only
300×600 or 300×250

No interstitials, pop-unders, auto-redirects or overlays during play; no ad inside the result modal; no ad between tap and result.
15.2 Behavior
• Config: ADS_ENABLED, AD_PROVIDER and per-slot IDs from configuration. Disabled means containers render nothing in production and a dashed "Ad placeholder 320×100" in development and staging.
• Loading: load ad script after first paint and after the game is interactive; lazy-load below-the-fold slots; 3-second timeout, then collapse to a fixed-height neutral block with no layout jump.
• Ad blockers: the game works identically. No gating, no guilt messaging. An optional neutral line such as "Ads help keep this free" is allowed.
• Consent: ad scripts load per the consent decision where required [REVIEW]; the privacy page names the ad network.
• Development safety: a test asserts the ad script URL is absent unless ENV is production and ADS_ENABLED is true. Unapproved ad code is never loaded in development or CI.
• Performance budget: ads must not push LCP past 2.5 s or CLS past 0.1 in staging tests.
15.3 Prohibited practices [CONFIRMED]
No asking for clicks, no rewarding clicks, no ads styled as game buttons, no forced ad interaction to continue, no artificial impressions, no misleading content hiding the game, no unapproved ad code in development.
15.4 Revenue estimation
Estimated gross ad revenue = billable impressions / 1,000 × effective CPM.
Hypothetical scenarios, illustrative only and not forecasts:
Scenario
Visits
Billable impressions per visit
Billable impressions
Effective CPM (hypothetical)
Gross revenue
Low
10,000
1.5
15,000
$0.20
$3.00
Medium
50,000
2.5
125,000
$0.50
$62.50
High
200,000
3.0
600,000
$1.00
$600.00
Realized income differs because of actual CPM, fill rate, viewability, invalid-traffic filtering, network fees, payment thresholds, payout availability in Nepal, currency conversion and taxes. All must be checked with the chosen network [REVIEW]. No network approval is assumed.
16. SEO and organic growth
No ranking, traffic or virality is promised. SEO supports discoverability; sharing is the main growth loop.
Item
Requirement
Title
Unique per page, ≤ 60 characters, e.g. "Dashain Dhamaka – Free Dashain Spin Game (Virtual Points)" plus Nepali variant
Meta description
120–155 characters, accurate, states it is a free virtual game
Open Graph / Twitter
og:title, og:description, og:image (1200×630), og:url, og:locale (ne_NP, en), twitter:card summary_large_image
Canonical
One canonical URL per page; referral parameters (?r=, utm_) canonicalised to the clean URL
Crawl files
robots.txt (staging fully disallowed), sitemap.xml listing real pages only
URLs
Clean: /, /rules, /privacy, /about
Rendering
Prerender or statically generate the landing and static pages so crawlers and in-app browsers see content without running JS
Performance
Mobile LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms (targets on mid-range Android, throttled 4G)
Semantics
One h1 per page, ordered headings, landmarks, alt text, lang attribute per language
Content
Concise Nepali and English copy: what the game is, how points work, honest virtual-only statement
Structured data
WebSite and Organization only when details are real and valid; none for prizes, reviews or ratings
Avoid
Thin duplicate pages, keyword stuffing, fake reviews, fake counters
17. Analytics and KPIs
17.1 Events
Client events are interaction signals and can be blocked or inflated. Backend records are authoritative.
Event
Source
Authority
landing_view
Client
Interaction
play_click
Client
Interaction
spin_requested
Client
Interaction
spin_completed
Backend (spins table)
Authoritative
spin_failed (with error code)
Client + backend logs
Interaction + log
reward_category (small, medium, high, grand)
Backend
Authoritative
share_clicked, link_copied
Client via /v1/events
Interaction only; never proof of delivery
referral_landing
Client via /v1/events, deduped
Interaction, deduplicated
return_visit
Backend (session found with spins_used > 0 or earlier day)
Authoritative
Event payloads contain no personal data. Analytics tool options [OPEN O-9]: a privacy-friendly tool (Plausible, Umami, Cloudflare Web Analytics) plus the first-party events above.
17.2 Metrics
Metric
Definition
Unique visitors
Distinct anonymous sessions or analytics visitors per day
Play-start rate
Visitors with ≥ 1 spin_requested / landing_view visitors
Spin completion rate
spin_completed / spin_requested
Share-action rate
Players with ≥ 1 share_clicked / players with ≥ 1 spin_completed
Referred visits
Deduplicated referral_landing count (not "people referred")
Returning visitor rate
Sessions active on ≥ 2 distinct days / all sessions
Pages per session
Page views / sessions
Ad fill rate, effective CPM
Taken from the ad network dashboard
Estimated vs finalized revenue
Network-reported estimates reconciled with final payout statements
Decisions must not push users toward ad clicks or hurt policy compliance. Metrics inform UX and content, not ad-click optimisation.
18. Testing and quality assurance
18.1 Automated tests
Area
Test
Pass criteria
Config
Weights sum
Equals 10,000; points as specified
Probability
1,000,000 simulated draws
Each segment within ±0.15 percentage points; grand-rate 0.4% ± 0.05; chi-square p > 0.01 (rerun on failure to avoid flakiness, fail on repeated breach)
Expected value
Mean of simulated draws
273 ± 5 per spin; formula test 273.0 exactly
Allowance
6 sequential spins, new session
5 return 200; 6th returns 409 NO_SPINS_REMAINING
Atomicity
Inject failure after spin insert
No spin, no ledger, no balance change
Duplicates
Same key sent 10 times
One spin row, one ledger row; replays return replayed true
Concurrency
20 parallel spins with distinct keys
Exactly 5 succeed, 15 get 409; balance equals ledger sum
Concurrency
20 parallel with the same key
Exactly one spin row
Invariants
Nightly check
points_balance equals SUM(points_delta); spins_used equals spin count
Sessions
Expired, invalid, tampered token
401 SESSION_INVALID; new session creates a fresh player
Rate limits
Burst above limits
429 with Retry-After; resumes after window
Validation
Bad bodies, unknown events, oversized payloads
400 or 413; no 500
Referral
Same visit_id twice; self-referral
One counted; self ignored
Security
SQLi and XSS payloads in all inputs; secret scan
No injection; no secrets in bundle
Frontend
Component tests for wheel states, modal, wallet; Playwright flows
See acceptance criteria
Accessibility
axe-core in CI; keyboard-only run
No critical violations
Ads
Placeholder test; production script absent when disabled
Assertion passes
18.2 Acceptance criteria for critical flows
Flow
Acceptance
First visit
Session created in ≤ 1 request; 5 spins shown; no PII requested
Spin
Exactly one result per accepted request; UI animation lands on server segment; wallet matches API state
Retry
Network drop after commit then retry returns the same result; spins_remaining decreased once
Failed request
Spins unchanged after any 4xx/5xx other than a committed 200
Exhausted
Spin button disabled; API 409; share and wallet still work
Refresh
State identical after reload; pending spin recovered
Share
No claim of delivery; copy fallback works where native share is missing
Referral
Opening ?r=CODE records one landing; the visitor plays independently
Ads off/on
No layout shift beyond 0.1 CLS; game fully usable with ads blocked
18.3 Manual QA checklist
• Test on low-end Android (Chrome, Samsung Internet), iOS Safari, Facebook and Messenger in-app browsers, and desktop Chrome and Firefox.
• Throttle to slow 3G and 4G; toggle airplane mode mid-spin.
• Cleared storage, private mode, cookies disabled.
• Reduced-motion and 200% text zoom; screen reader pass on wheel, modal and wallet.
• Check Nepali text for clipping and font fallback.
• Verify the virtual-entertainment notice is visible on every key screen.
• Check every external link, share link and sitemap URL.
18.4 Non-functional targets
Initial JS ≤ 150 KB gzipped; total landing weight ≤ 500 KB excluding ads; contrast ≥ WCAG AA; touch targets ≥ 44 px; evergreen browsers from the last two years plus Android WebView and iOS Safari 15+ (assumption, validate against analytics).
19. Launch checklist
[ ] Virtual-only notice approved and visible; no real-prize claims anywhere, including share cards and meta tags
[ ] Rules page lists all outcomes and probabilities, matching the active config version
[ ] Legal, privacy and ad-policy review done [REVIEW]
[ ] Probability and concurrency tests pass in staging
[ ] Rate limits, CORS, HTTPS, HSTS and CSP set in production
[ ] Secrets only in host environment; secret scan clean
[ ] DB backups on; migration applied; config version 1 active
[ ] Error monitoring and uptime ping active
[ ] Analytics and consent banner verified
[ ] Ads off by default; enabled only after network approval and placement test
[ ] robots.txt, sitemap, canonical tags, OG image verified in a sharing debugger
[ ] Nepali copy reviewed by a native speaker
[ ] Rollback plan and runbook written; contact email monitored
20. Implementation roadmap
Three-day target for P0, assuming one full-stack developer plus part-time design and the stack above. Ad approval and traffic growth are outside this schedule and may take longer. [ASSUMPTION]
Day
Tasks
Dependencies
Deliverable
Test checkpoint
1 AM
Repo, CI, Docker Postgres, Alembic baseline; schema 13.1–13.5; seed config v1
None
Running API skeleton, DB
Migration up/down; config weight test
1 PM
Session endpoint, state, spin service with transaction, idempotency, RNG; rate limiting
Schema
/v1/sessions, /v1/state, /v1/spins
Probability, allowance, duplicate and concurrency tests
2 AM
Frontend shell, design tokens, home page, wheel component, API client, session handling
API contract
Playable wheel against staging
Manual spin flow; refresh recovery
2 PM
Result modal, wallet, history, spin-limit and error states, reduced motion, i18n
Wheel
Complete game loop
Accessibility pass; offline test
3 AM
Share modal, referral params, events endpoint, analytics, static pages (rules, privacy, about), SEO tags, ad placeholders
Game loop
Feature-complete staging
Share fallbacks; referral dedupe; Lighthouse
3 PM
Production deploy, security headers, monitoring, final QA, launch checklist
All above
Live site (ads off)
Launch checklist 100%
Post-launch: submit site to ad network after the site is live and compliant; evaluate P1 items after reviewing a week of analytics.
21. Risks and mitigations
Risk
Likelihood
Impact
Mitigation
Users believe a real prize exists
Medium
High
Prominent virtual-only notice, no prize art without label, copy review
Legal classification concerns (gambling or lottery) [REVIEW]
Unknown
High
No stake, no prize, no cash-out; legal review before launch
Ad network rejects or delays
Medium
Medium
Launch with ads off; apply to more than one network; keep site policy-clean
Invalid traffic flags
Medium
High
No click incentives, monitor sources, filter bots
Traffic spike overloads free tier
Medium
Medium
Static CDN, light API, upgrade path, caching, rate limits
Session abuse for extra spins
Medium
Low
New-session throttle; points have no value
In-app browsers block storage or share
High
Medium
Bearer fallback, copy-link fallback, test on Facebook/Messenger
Double-award bug
Low
High
Constraints, row lock, idempotency, concurrency tests
Data privacy complaint
Low
Medium
Minimal data, no raw IPs, clear policy, deletion by contact
Three-day schedule slips
Medium
Medium
Hold P0 scope; cut P1 first; ads and extras after launch
22. Explicit out-of-scope features
User registration or login; email, phone or social sign-in; cash-out or withdrawal; paid points or purchases; cryptocurrency; real-world prize redemption; iPhone or AirPods giveaway claims without a documented prize program; referral rewards; leaderboards; chat or other social features; contact-list access; browser fingerprinting as identity; admin dashboard (P1).
23. Open questions and decisions for the product owner
ID
Decision
Proposed default
O-1
Does the spin allowance ever refill (daily or by event), and what is the session lifetime?
No refill in MVP; 30-day sliding session; revisit after launch data
O-2
How is the 100,000-point milestone presented, given it is unreachable in 5 spins (max 50,000)?
Show it only as a decorative "journey" meter or omit it; do not imply it is attainable
O-3
May iPhone or AirPods art appear?
Only labelled "Decorative artwork", or avoid entirely
O-4
Which ad network and which formats?
Decide after approval; build to config flag
O-5
Domain name, hosting providers and monthly budget (O-8)?
Custom domain with api. subdomain; budget cap set by owner
O-6
Who performs legal and privacy review before launch?
Local counsel or qualified advisor [REVIEW]
O-7
Who supplies and reviews Nepali copy?
Native-speaker reviewer
O-8
Monthly infrastructure budget and acceptable upgrade triggers
Owner to set
O-9
Analytics tool and consent approach
Privacy-friendly analytics plus consent banner for ads
O-10
Are real prizes ever planned?
Not in MVP; requires a separate prize-program specification
Numerical consistency check. Probabilities total 100% and weights total 10,000. Expected value is 273 per spin and 1,365 per five spins. Five spins cannot exceed 50,000 points. The 5-spin allowance, 409 on exhaustion, idempotent retries and the unique (player_id, spin_number) and (player_id, idempotency_key) constraints are consistent across sections 4, 8, 12, 13 and 18.