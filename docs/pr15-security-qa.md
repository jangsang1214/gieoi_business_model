# GIEOI PR #15 — Security & Data Integrity

## Shipped in this PR
- TEAM application and reapplication use one Postgres transaction through `submit_team_application` (SECURITY INVOKER, authenticated only). Pending or accepted status returns the existing request; rejected/withdrawn requests may be replaced atomically.
- `proofs.record_id` now cascades on Record deletion. Independent Proofs without a Record remain intact.
- Record deletion writes media paths to `private.record_media_cleanup` for reconciliation if best-effort browser cleanup fails. The queue is stored in the private schema with RLS and is not accessible to ordinary users. **Queue processing is still an operational follow-up**, not automatic cleanup.
- Reciprocal blocks are checked by a narrowly scoped DB helper using the current authenticated identity. Public profile, Record, Proof, Goal, Follow, comments and direct/request conversations respect blocks. TEAM group conversations remain accessible to their existing participants.
- Blocking removes mutual follows.
- User safety UI: block/unblock in profile/settings, report user/record/proof/TEAM/message.
- Basic report input constraints and target indexes.

## Required two-account QA (not completed by the build)
1. A creates public and private Records, including one with photos and a linked Proof. B can view public but receives 404/403 for private Record and photo.
2. A follows B; then A blocks B. Both follow directions disappear. A and B cannot read each other's discoverable profiles/content, start new DM, or send messages in an existing DM. Existing TEAM group membership remains accessible.
3. A unblocks B in Settings; ordinary discoverability returns, but previous follows are *not* recreated.
4. A reports B's profile and a Record. Verify rows exist for A only and a second user cannot read their reports.
5. B applies to A's TEAM, and A rejects. B reapplies. Confirm one pending application and never a deleted application without a replacement after a simulated failure.
6. A accepts the application. Application status and active membership must appear in the same transaction.
7. A deletes the linked Record. Linked Proof is also deleted; an independent Proof remains. Image should be inaccessible. Check queued media paths and eventual object cleanup.
8. Test username/privacy/blocked access by direct HTTP Data API calls, not only hidden UI buttons.
9. Test at 320px and 390px widths, dark/light rendering, and mobile Safari if possible.

## SQL verification probes
`select conname,pg_get_constraintdef(oid) from pg_constraint where conrelid='public.proofs'::regclass and conname='proofs_record_id_fkey';`

`select to_regprocedure('public.submit_team_application(uuid,uuid,text,integer)');`

`select id,public from storage.buckets where id='record-media';` (must be false)

`select count(*) from private.record_media_cleanup where cleaned_at is null;` (operations cleanup debt)

`select tablename,policyname from pg_policies where schemaname='public' and tablename in ('profiles','records','proofs','goals','conversations','follows','record_comments');`

## Notes
- The SQL has been applied to the linked production Supabase project. The app's Preview build only verifies compilation; it does not prove all user permissions work at runtime.
- `private.record_media_cleanup` needs a scheduled privileged worker or manual reconciliation before full-scale public release. Do not delete queue entries without confirming the corresponding file was removed.
- Supabase leaked-password protection remains an account-level dashboard setting.
- Do not assume private buckets alone protect content: the application media endpoint and Postgres RLS must both authorize access.
