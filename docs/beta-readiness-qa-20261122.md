# prof. beta-readiness QA — 2026-11-22

## Fixes in this PR
1. Include **people** in the default Explore result set. Previously people were
   only fetched for explicit person-filter or non-empty search queries.
2. Person cards give grounded reasons: shared interest, already following, or
   candidate-declared interests. Never show a fabricated match percentage.
3. First Journey/Proof record defaults to a category from the user's profile
   rather than assuming BUSINESS. Choosing a Goal picks the Goal's category;
   a manually selected category is respected.
4. Recording examples insert actual newlines, not literal `\\n` characters.
5. Client-side submit guard prevents the same record action from executing
   twice before React's disabled state renders.
6. On failed Proof creation after Record insertion, the app attempts to roll
   back the Record and uploaded media while keeping the user's draft. If
   rollback fails, the user is shown an explicit incomplete-record link
   instead of a false success or silent duplicate.
7. Inputs now cap record body length at 5,000 characters.

## CI and manual test matrix
- [ ] Node test: shared-interest discovery reason is supported by the
      candidate's actual profile domains; no match score is invented.
- [ ] TypeScript check, existing auth redirect tests and record reactions
      tests, Next.js production build all pass.
- [ ] Two users: default Explore lists another discoverable person without
      needing a search term; private/blocked profiles are not exposed (RLS).
- [ ] First post for WORKOUT user is categorized WORKOUT; user can override
      it and can select an active Goal in a different category.
- [ ] Writing template yields a real newline, not backslash-n on screen.
- [ ] Simulate Proof insert error: record insert rolled back and form draft
      remains available; media cleanup attempted.
- [ ] Simulate Record rollback error: show published-record link and prevent
      accidental duplicate submission.
- [ ] Mobile widths 320/375/390px, both KO/EN, keyboard and screen reader.
- [ ] Auth, account export, deletion requests, notifications and all
      TEAM/Opportunity flows verified with 2 separate test accounts.

## Outstanding release blockers not solved by this PR
- Supabase leaked-password protection configuration.
- Real account deletion lifecycle and legally reviewed Terms/Privacy Policy.
- Live, authenticated two-account E2E tests in a dedicated test environment;
  this PR does not touch production user or collaborative data.
- English translations of remaining TEAM/Profile/Proof/safety pages.
- Vercel deployment access may require team authorization for interactive QA.

Do not equate green CI with fully validated user-facing operation.
