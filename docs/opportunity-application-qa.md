# prof. Opportunity formal application beta QA

## Database applied to business / gieoi
- `prof_opportunity_application_workflow`: creates `public.opportunity_applications`, status enum, indexes, state-transition trigger and four participant RLS policies.
- `prof_opportunity_application_block_guard`: explicitly denies application creation where the author/applicant has blocked the other party.
- Both migrations were executed through the Supabase migration API. Existing opportunities and team applications were not modified.
- Authenticated role can `SELECT`, `INSERT`, and `UPDATE(status)` only. `anon` has no table rights.
- Applicant and listing owner can see only their own applications. Only applicant may withdraw pending applications; only listing author may accept/reject pending applications. Guard trigger rejects later state changes or changes to the applicant/opportunity/proof/note.
- A linked Proof must be public and belong to the applicant.

## Current user flows
1. Visitor opens an active Opportunity and sends an informal DM inquiry (optional, separate flow).
2. Visitor submits one formal application with a brief pitch and optional public Proof.
3. Visitor can see their current status in Opportunity detail and **내 지원 현황**.
4. Visitor may withdraw only while pending. Reapplication after withdrawing is not supported in this beta.
5. Poster opens **지원자 관리**, reviews only applicants for their listing, sees application text and public Proof, and accepts or rejects.
6. Decisions are terminal and currently do not imply membership, employment, payment or official hiring.

## Two-account manual QA (not yet executed)
- [ ] A creates Opportunity; B submits 10–1500 character application with/without a public Proof.
- [ ] B sees pending in detail and My Applications. A sees it in owner review.
- [ ] A can inspect B's linked Proof, approve, and B sees accepted.
- [ ] A can reject a separate applicant, status appears rejected.
- [ ] B withdraws pending application; A sees withdrawn. No further edit or resubmission.
- [ ] Duplicate submission is rejected by unique constraint.
- [ ] A cannot apply to own Opportunity; another user cannot review A's listings.
- [ ] Submitted private/non-owned Proof is rejected by RLS + trigger.
- [ ] Updating author ID, note, or target via REST is blocked; terminal statuses cannot be changed.
- [ ] Cross-account blocks prevent new formal applications, including direct API submissions.
- [ ] Closed/paused Opportunity cannot accept new applications.
- [ ] 320/390px mobile forms, details, owner list, accessibility and keyboard interactions.
- [ ] Check production migration history, RLS policies and security advisor.
- [ ] User notifications for decisions are **not** in this PR. Add after recipient-safe event triggers and opt-in preferences.
- [ ] No fake profiles or sample applications inserted in production.

## Future
1. Formal application accepted/rejected notification with RLS-safe recipient routing.
2. Separate spam/rate limiting, authenticity and review/audit history.
3. Interview/proposal/invite transitions, explicit consent and success-rate analytics.
4. External public previews for opted-in Opportunities and Proof.
5. Dedicated deadline, venue, remote, internship/competition types.
