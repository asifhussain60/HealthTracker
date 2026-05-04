# HealthTracker — Privacy & Sensitive Data

**Status:** active · **Owner:** architect · **Last updated:** 2026-05-03

This app tracks medical-adjacent personal data: weight, food intake, cannabis use, medical flags, certifications, and progress photos. We treat it carefully — even though we are not under HIPAA (no BAA with a covered entity), the data deserves real protection.

## What is sensitive

| Category | Examples | Treatment |
|---|---|---|
| Cannabis use | Logs, products, dosing, effects, medical benefit ratings | High |
| Weight + body metrics | History, photos | High |
| Medical flags | Conditions, certifications | High |
| Food logs | Meals, calories | Medium |
| TODOs | Personal/professional tasks | Medium |
| Workout logs | Steps, durations | Low |

## Phase 0–1 — local only

Today the app is client-side. localStorage is per-browser. There is no network attack surface for the data.

Mitigations now:
- Export bundle from Profile is JSON-only; never sent anywhere.
- Photos stored as base64 in localStorage (note: 5MB cap; user is informed).
- No telemetry, no analytics, no third-party SDKs.

## Phase 2 — Supabase backend

When the backend lands, all data leaves the device. Mitigations:

### Encryption at rest

- Supabase default: AES-256 at the disk level.
- **Column-level via pgcrypto** for high-sensitivity fields:
  - `cannabis_sessions.notes`
  - `cannabis_sessions.medical_benefit`
  - `cannabis_sessions.preUsePain` and other pre-use ratings
  - `cannabis_products.notes` (if it contains personal context)
  - `profile.medical_flags`
  - `profile.certification`
  - `weight_history.weight` (light — depends on user preference)
- Encryption key derived per-user via `pgcrypto`'s envelope; not exposed to non-RLS-cleared queries.

### Row-Level Security (RLS)

Every table has RLS policies:

```sql
-- Owner-only example
CREATE POLICY "owner_full"
  ON cannabis_sessions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- TODOs allow assignee to read+update
CREATE POLICY "assignee_read"
  ON todos
  FOR SELECT
  USING (assignee_id = auth.uid() OR user_id = auth.uid());
```

### Auth

- Google SSO only at Phase 2 launch (no password store).
- 3 roles: owner, member, viewer (see `architecture.md`).

### Transport

- HTTPS-only (Supabase default; service worker enforces).
- HSTS on the static host (Vite build target).

### Export & deletion

- User can export full data bundle (JSON) at any time.
- **Optional password protection** on export bundles (AES-GCM via Web Crypto API). User-set passphrase derives the key.
- **Right to deletion** — Profile view includes "Delete my account and all data" with a 7-day grace period (soft-deleted records purged after 7 days).

### Audit log

- All write operations logged to a `audit_log` table with `userId`, `action`, `tableName`, `recordId`, `timestamp`.
- Users can view their own audit log from Profile.

## What we never do

- No third-party trackers (Google Analytics, Hotjar, etc.).
- No marketing emails ever.
- No selling, sharing, or monetizing data.
- No AI training on user data without explicit per-feature opt-in (Phase 4 AI assistant: opt-in, off by default).
- No silent telemetry.

## What the user owns

- The data is theirs. The export gives them a complete copy.
- They can self-host the Supabase project if they want full control (post-Phase-2 enhancement).
- They can stop using the app and take their data with them.

## Compliance posture

We are **not** HIPAA-compliant (no BAA infrastructure, no covered-entity relationships). The app is suitable for:
- Personal use
- Family/household members who consent
- NOT suitable for: clinician-facing workflows, insurance documentation, or any context requiring HIPAA, GDPR (DPA), or HITECH compliance.

A user who needs that compliance should not use HealthTracker for that purpose. The Profile view will surface a one-line statement of this scope.
