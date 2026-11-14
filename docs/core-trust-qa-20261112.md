# prof. Core trust + acquisition-ready onboarding (2026-11-12)

## Implemented
- Goal creation validates fields, disables duplicate submission, preserves typed
  fields on failure, and only closes after a successful database insert.
- Direction editor no longer overwrites `preferred_domains`,
  `open_to_opportunity` or derived recommendation statistics. Editing only
  fields this screen owns with INSERT vs UPDATE; 0-row UPDATE is an error.
- Profile Settings update now requires a returned row before showing success.
- TEAM creation starts **not discoverable**, then adds the founder member, then
  publishes. On either subsequent failure the UI attempts to remove the
  incomplete TEAM; if cleanup also fails it shows a link to the affected TEAM.
  This is a *compensating rollback*, **not a database transaction**.
- Auth email confirmation now validates OTP types and restricts `next`
  redirection to same-origin local paths. Recovery tokens must reach
  `/reset-password`. A PKCE `/auth/callback` exchanges codes safely.
- User-facing bilingual email password recovery and new-password screens.
  Recovery emails intentionally do not reveal whether an account exists.
- Public, bilingual `/about` marketing introduction is visible without
  signing in, with no fabricated testimonials or user counts. Linked from login.
- Sign-in text no longer claims legally binding agreement to Terms/Privacy
  documents which are not available on the current site.
- `tests/safe-next-path.test.mjs` security regression tests are run in PR CI.

## QA (run on preview before merging)
- [ ] Logged-in user creates Goal successfully and sees it in profile.
- [ ] Simulated Goal INSERT permission/network error: fields are preserved and
      a clear error is announced, without showing a saved Goal.
- [ ] Existing direction profile has non-empty `preferred_domains`. Editing
      future tags must retain this field and derived stats unchanged.
- [ ] Simulated direction/profile UPDATE error: no false success notice.
- [ ] New TEAM: founder is active member and TEAM only becomes discoverable
      after member registration. Inject a member insert failure; confirm
      incomplete TEAM is deleted or clearly linked if cleanup fails.
- [ ] Mobile and desktop public `/about` renders in Korean/English without
      login; signup links remain functional and localized.
- [ ] Forgot-password page accepts email, uses account-enumeration-safe
      confirmation, works with rate limits, then returns from email through
      `/auth/callback?code=...&next=/reset-password`.
- [ ] New password requires 8+ matching chars; expired links fail gracefully,
      successful change revokes recovery session and requires new login.
- [ ] Supabase email redirect allowlist includes the intended production and
      preview callback URLs before testing; SMTP must be configured.
- [ ] `/auth/confirm?next=//evil.example` and absolute external redirect
      values cannot send users to external sites.
- [ ] No new DB schema, RLS, team data or production accounts were created by
      this PR; automatic GitHub CI and Vercel preview pass.
- [ ] Two-account end-to-end workflow (signup → Goal → Proof → TEAM →
      application → message → outcome) passes, including 320px viewport.

## Known blockers before broad public acquisition
1. Actual Terms of Service and Privacy Policy still need an owner-approved
   legal/privacy review and public URLs (not fictional legal text).
2. Self-service account deletion needs a carefully permissioned server/admin
   deletion flow and an explicit policy for dependent user content. Not yet
   implemented.
3. Supabase Auth leaked-password protection is currently disabled: enable it
   through the dashboard and review email SMTP/URL allowlist configuration.
4. Team create compensation is not atomic. For higher scale, move to a
   transaction-backed, authorization-checked DB operation after a schema review.
5. The English experience remains partial on remaining TEAM, Profile, Proof
   and notifications screens; coordinate with pending language PR #26.
6. Realtime, mobile UI, social reactions and onboarding analytics require
   additional real two-account testing and implementation.

## Branch dependencies and release
`fix/prof-core-trust-20261112` is based on pending
`feat/prof-korean-english-switch-20261110` (PR #26). Do not merge this PR
before PR #26. No Supabase migrations are included.
