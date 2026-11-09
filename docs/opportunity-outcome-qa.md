# prof. Opportunity — notification, accepted DM and mutual outcomes (PR #23)

## Product rationale
Opportunity closes the core loop:
**GOAL → JOURNEY → PROOF → matching → Opportunity → application → collaboration → new PROOF**.

A formal application is not a collaboration result, and an accepted application is
not verified employment or proof of completion.

## Delivered
- A private, database-triggered notification to the listing owner on a new
  application, and to the applicant on accept/reject, plus a withdrawal notice
  to the owner. The application trigger fires in the same transaction as the
  state change, not as a client-authored notification.
- On accepted applications, both parties have a deliberate **메시지** action.
  Existing conversations/DML are still subject to authorization and blocks;
  no automatic unsolicited chat is created by acceptance.
- One optional **outcome report** per accepted application, submitted by the
  applicant with a title, summary and (optionally) an applicant-owned public Proof.
- Only the listing author can confirm or decline the submitted report. The
  status transition is terminal and author/applicant cannot change immutable
  fields. Confirmation means the counterparty attested the collaboration; it
  does **not** grant an organization-verified or team-verified provenance badge.
- Owner's own Proof tab includes confirmed Opportunity outcomes privately,
  alongside ordinary Proof, with distinct wording.
- Both sides receive notification when the report is submitted or decided.

## Database migrations applied
Supabase business account, project `gieoi`:
- `prof_opportunity_application_notifications`
- `prof_opportunity_outcomes_mutual_confirmation`

New table `public.opportunity_outcomes` has an RLS policy for participant
reading, owner decisions, applicant creation. No anonymous SELECT/INSERT/UPDATE.
Only `UPDATE(status)` is granted; a trigger is responsible for adding reviewer
identity/timestamp. A UNIQUE constraint prevents duplicate reports.

## Explicitly not delivered
- Public listing of confirmed outcomes on *other people's* profiles: a
  public consent feature and dedicated safe data view is needed first.
- Automatic external verification or credential certification.
- Employment or Team membership after acceptance.
- Auto-inserting a new Proof or an `organization_verified` provenance.
- User-generated DM on automatic acceptance: DM initiation stays intentional.
- End-to-end UI testing with two authenticated real users.

## Test acceptance checklist (two consenting accounts)
- [ ] Account B applies to an opportunity owned by A. A receives application
      notification only once, with a link to A's reviewer page.
- [ ] A accepts. B receives decision notification; both parties see a direct
      message action and can start a thread intentionally.
- [ ] A rejects another application. B sees rejection and gets a notification.
- [ ] B withdraws a pending application. A gets withdrawal notification.
- [ ] B submits an outcome on an accepted application. A receives a confirmation
      request and can open it from Notifications.
- [ ] A confirms the report. B receives notification and sees confirmed in
      My Applications and their private Proof tab.
- [ ] A rejects the report. B sees declined, without verified badge.
- [ ] B cannot submit a report for a pending/rejected application or someone
      else's accepted application, by UI or REST.
- [ ] A cannot submit an outcome pretending to be B. A cannot modify B's
      report content or confirm twice. B cannot self-confirm.
- [ ] Private/non-owned Proof cannot be attached; empty/short summaries fail.
- [ ] Blocked counterparts cannot create new outcomes.
- [ ] A fresh or logged-out visitor cannot fetch private applications/outcomes.
- [ ] Mobile widths 320/390px, and dark theme readability tested.
- [ ] No production test data or fake evidence inserted.
- [ ] Confirm all three PRs #21→#22→#23 TypeScript/preview build checks.
