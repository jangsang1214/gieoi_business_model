# prof. beta stabilization — 2026-11-09

## Changes
1. Mobile navigation **six columns**: `product.css` is imported after
   `globals.css`, so the effective rule under 920px must be updated there.
   Previous `repeat(5, 1fr)` wrapped the new Opportunity/Profile tabs.
2. Opportunity inquiry **conversation scope**: reuse only request threads
   with `team_id IS NULL` and exact `title = 기회 문의`, never TEAM proposal
   requests or other unrelated conversations. Existing incorrectly mixed
   message history is not modified.
3. **Saved opportunity membership**: after save/unsave/dismiss, refresh the
   server-filtered results. A failed Supabase mutation no longer updates
   optimistic local state as if it had succeeded.
4. Owner **application pagination**: fetch in ordered batches of 50 with
   `count: "exact"` and stable `created_at DESC, id DESC`. Previous/next
   links and bounded page parameter prevent older applicants and pending
   outcome confirmations from becoming inaccessible after 150 applications.
   Existing app permissions and public access are unchanged.

## Manual QA matrix — login required, no production test data inserted
- [ ] 320 / 360 / 390 / 768 / 920 px: all six mobile nav items stay on **one row**,
      each item has a readable label, taps navigate correctly, safe-area bottom
      inset does not conceal content.
- [ ] At desktop widths (>920px), no mobile nav is shown. Desktop rail is intact.
- [ ] Opportunity inquiry between two users with an existing TEAM proposal:
      sends to a **separate request**; team proposal thread retains its title,
      team link and message history.
- [ ] Repeated Opportunity inquiry between same users reuses inquiry thread
      instead of generating needless duplicate conversations.
- [ ] Save → saved view → unsave: unsaved card disappears automatically;
      no browser reload needed. Save → un-save → save and dismiss states work.
- [ ] Simulate a rejected Supabase feedback update (e.g., permission failure):
      client state remains unchanged and the user sees an error.
- [ ] Owner account with 151+ applicants: page 1 shows latest 50; page 2
      shows next 50; page 4 shows older applicants, including pending ones.
      All accepted applicants' outcome requests remain reachable.
- [ ] Applicant list: invalid page, empty list and out-of-range page show
      appropriate navigation; duplicate timestamps have stable order.
- [ ] Another logged-in user cannot open owner application review.
- [ ] Verify selected Home/Messages pill text contrast from PR #24 persists.
- [ ] Verify mobile keyboard focus / large text / screen-reader tab navigation.
- [ ] Regression: confirmation/withdrawal, notifications, DM and Proof
      associations still behave as in PR #23.

## Technical verification
- [ ] GitHub Actions typecheck
- [ ] Vercel Preview Ready
- [ ] Two-user end-to-end test by a beta tester (not automated yet)

No Supabase migrations or production DB writes for this patch.

## Merge order
This branch builds upon the pending PR stack #21 → #22 → #23 → #24.
Merge those in order, then this stabilization PR, or rebase/cherry-pick individual
fix commits if landing earlier is preferred.
