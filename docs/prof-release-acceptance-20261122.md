# Prof. public beta acceptance checklist — 2026-11-22

## Clear product definition
Prof. is a goal-, activity-, and project-oriented social network. Members
create Goals, publish Journey updates (optionally photos), document Proof,
discover and follow people, comment, share and DM, create/join TEAMs,
publish or apply for Opportunities and review collaboration outcomes.
Examples are on /about in Korean and English. Self-reported achievements
are NOT automatically independently verified.

## Changes included
- Unified all known user-facing `프로프`, `prof.`, `PROF.` strings to
  the canonical display name `Prof.`; internal URL identifiers and file
  names are not rebranded to avoid breaking routes.
- Concrete six-feature description and use cases, plus accurate SEO/meta copy.
- Korean auth, home and messages copy describe user actions, not an abstract
  mission statement.
- Signup requires 8–72 chars, matching the current recovery password minimum,
  and handles network failures without a permanently disabled submit button.
- Synchronous submission guard prevents duplicate login/signup requests.
- TEAM creation screen has KO/EN labels and descriptive entry copy.
- Narrow mobile landing layout has one-column actions and readable cards.
- New built-server smoke test: public /about, brand + service details in
  KO/EN, locale validation/origin check, anonymous export 401, and private
  settings login redirect. Runs after the existing TypeScript, unit tests
  and Next production build.

## Verification classes (do not conflate)
1. **Automated**: TypeScript + unit tests + production build + built-server
   HTTP smoke on temporary test process. PASS only once CI is green.
2. **Database review**: existing read-only RLS advisor and SQL calls. On
   2026-11-22 direct database SQL requests returned 'Database is possibly
   not accessible at the moment'; not counted as a PASS.
3. **Two-account E2E** (NOT YET VERIFIED): using separately created test
   accounts, test signup, login, KO/EN selection, Goal, Journey, Proof,
   comments, likes, follows, DM, TEAM create/apply/accept, Opportunity
   create/apply/review, notifications, and confirmed outcomes.
4. **Mobile manual QA** (NOT YET VERIFIED): device widths 320/375/390px,
   keyboard and screen reader, login, /about, Home, Record composer, Team,
   Opportunity, Messages, Settings; test iOS Safari and Android Chrome.

## Launch blockers outside this PR
- Actual complete account deletion processing and approved Privacy Policy /
  Terms. A deletion-request submission is not itself account removal.
- Confirm secure real email callbacks/SMTP and compromised-password
  protection in Supabase Auth dashboard.
- Verify all row-level policies with actual two-account RLS tests when the
  database is accessible.
- Remaining detailed TEAM/Profile/Proof/safety translations and real mobile
  acceptance must be completed before claiming fully international release.
- Parent PR #29 (discovery improvements and Proof write recovery) remains
  pending. Merge and verify it before merging this follow-up.

No paid promotions, production account deletions, content seeding, or
destructive schema changes are performed by this PR.
