# prof. privacy, onboarding and social beta QA (2026-11-14)

## Added
- Authenticated JSON download of user's own account/profile, goals, proofs,
  records, authored comments/messages, and selected related rows.
  Up to 1,000 rows per section; truncated sections are labeled. Not an
  exhaustive DSAR or binary media archive. Fails rather than returning
  partial results when any section cannot be queried. No-store headers.
- Account deletion **request** with explicit typed confirmation, unique
  pending request per user, and owner-only RLS. **No accounts are deleted**;
  status must be processed through a reviewed administrative procedure.
  Existing TEAM / opportunity references use RESTRICT and require decisions
  about other participants' records before real account deletion.
- Goal starter examples; context-sensitive first-use checklist; Journey and
  Proof writing starter prompts; Korean and English writing tips.
- Reactions on feed and record detail backed by a unique (record,user) pair,
  record-visibility-aware RLS, optimistic UI with rollback on errors.
- Comment deep link to #comments and native share/copy-link controls.

## Database migrations applied to Supabase business project
- `prof_reviewed_account_deletion_requests` (RLS, minimal pending review rows)
- `prof_record_likes` (RLS, unique reaction, cascade with record)
Versioned SQL: `db/account-deletion-requests.sql`,
`db/record-likes.sql`.

## Manual tests before release
- [ ] New signup: empty Home shows checklist; setting interests, creating
  a Goal, and posting a Journey mark each step complete.
- [ ] First Goal example is editable; validation and failure state work.
- [ ] Journey/Proof starter prompts insert text without auto-publishing.
- [ ] On public and followers/team/private visible posts, liking and
  unliking works. Liking an inaccessible post is denied by RLS.
- [ ] Two different accounts see the expected persisted like totals.
- [ ] Shared URL opens the intended record, respecting auth and visibility.
- [ ] Comment action scrolls to the comment form on permitted posts.
- [ ] Download JSON without session returns 401. Logged-in export downloads
  a private file that includes only this user's owned/authored rows.
- [ ] Data export section row limit includes `truncated: true` when exceeded;
  errors cannot silently return an incomplete archive.
- [ ] Deletion request requires exact typed confirmation; no deletion or
  sign-out occurs. Duplicate submissions return the existing pending request.
- [ ] Different account cannot see, change, or create request for another user.
- [ ] Mobile 320/390px and keyboard-only like/share/privacy controls.
- [ ] PR TypeScript checks and Vercel deployment green.

## Outstanding compliance and safety work
- A reviewed privacy notice, data retention policy, Terms, and actual
  deletion-processing operation are not yet implemented. Do **not** describe
  the deletion request as completed or a guaranteed deletion schedule.
- A complete data access/export workflow must include all relevant stored
  categories and handle more than 1,000 rows and media files.
- Real account deletion needs reauthentication, protected server-side admin
  service, dependent records retention/anonymization decisions, audit trail,
  and a lifecycle for requests; never expose service-role secrets to browser.
- Real device and two-account QA still required before public promotions.
- Current Supabase Auth leaked password protection warning remains active.
- English localization of all TEAM / Profile / Proof views is not complete.
- No production user account or content was deleted in this milestone.

## Integration
This work branches from `fix/prof-core-trust-20261112` (PR #27),
which includes KO/EN PR #26. Merge and test in dependency order.
