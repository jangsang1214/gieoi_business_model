# prof. Opportunity revival — Product rationale and beta QA

## Why Opportunity exists

The original GIEOI / prof. concept is **life → record → proof → discovery → opportunity**.
Opportunity is an independent first-class destination, not a job board clone or a
secondary tab inside TEAM. It gives ordinary people a reason to return to their
recorded work and gives organizations a future path to paid Scout workflows.

- Individuals: collaborative projects, TEAM proposals, auditions, internships and jobs,
  research, competitions and open calls.
- Teams: find contributors for concrete goals and invite people with complementary capabilities.
- Organizations: discover consented proof-backed talent, rising teams and suitable
  collaborators. Search subscriptions, outreach and publishing are possible B2B
  products *after* reliable data, consent, response rates and genuine outcomes exist.
- All life domains count: business, workout, creation, study, career and lifestyle.

Opportunity is not identical to Scout. Scout is a later, paid organizational
workflow layered on top of consented discovery and credible Proof.

## Implemented in this PR

- Restore **기회** to mobile navigation without hiding TEAM or DM.
- Add a discoverable Opportunity entry point from Explore.
- Search open opportunities; filter by domain, type and a saved/matched/all view.
- Show a **reason** only when explicit profile direction/skills/domain signals match
  a listing. Incomplete information does not imply a low ability score.
- Make save/dismiss work with the existing recommendation-feedback model.
- Improve opportunity posting with required input, optional skills/future-direction
  tags, client-side validation and visible insert errors. New listings remain
  *unverified* unless separately verified by the organization-verification process.
- Show an opportunity-linked **message inquiry**, with a typed confirmation step,
  as a recipient-visible request. Inquiries have a link back to the original post.
- Keep existing Supabase tables and enums unchanged; no destructive migrations.

## Not implemented / must not be misrepresented

- A message inquiry is **not a formal application**, acceptance or verified job offer.
  There is currently no application status / reviewer workflow for Opportunity.
- Competition and internship are currently grouped into the existing DB enum
  values `other` and `job` respectively; do not claim dedicated enum kinds.
- Discovery is presently capped at 100 recent open listings before local re-ranking.
  Add cursor pagination and scalable ranking as inventory grows.
- The ranking is a deterministic heuristic, not trained AI, audited suitability,
  or a guarantee of success. Do not sell a numerical people-rating scheme.
- Open listings and profiles still require authenticated app navigation. Public,
  consented, SEO/shareable previews with safe metadata should be a next PR.
- Verified organization is controlled elsewhere; a posted organization name
  is self-reported.
- No verified claims about candidate employment, credentials or proof without
  external verification. Businesses should never be given the private
  direction-profile data without explicit user consent.

## Beta acceptance tests (two consenting accounts A and B)

- [ ] On a 320px phone, all 6 nav items are visible and tappable; Opportunity is active
      on both list and detail. TEAM, DM and Profile remain accessible.
- [ ] Explore → 기회 navigates to /opportunity; browser back restores Explore.
- [ ] A creates a listing with tags in each of the six valid domains and verifies
      name, description, kind and tags on list/detail after page refresh.
- [ ] Enter whitespace-only title/body; reject rather than creating a listing.
- [ ] Simulate a denied insert to check the modal stays open and an error is visible.
- [ ] Filter each kind and domain; search title / organization / description.
- [ ] B saves a listing, opens the saved view, unsaves and rechecks the view.
      Dismissed items should disappear from lists but not be deleted.
- [ ] With no direction profile, matched view explains that it has insufficient
      signals; it must not display a fabricated percentage.
- [ ] With an explicit matching domain/skill tag, matched view and contextual
      explanation appear. Mismatched tags must never be described as aligned.
- [ ] B opens A's listing, sends an explicit text inquiry; A sees it in message
      requests and can navigate back to the listing from the message chip.
- [ ] Verify A cannot inquire about their own listing.
- [ ] Verify block relationships / inaccessible owner profiles cannot be used
      to bypass conversation or message RLS.
- [ ] Verify if listing is marked closed it does not appear in search nor detail.
- [ ] Verify creator cannot toggle `verified_organization` through the UI.
- [ ] Verify 320px, 390px and desktop layouts have no scroll clipping,
      overflow, inaccessible controls or broken focus states.
- [ ] Verify no personal direction tags are exposed to other users in API responses.

## Next product stages

1. Separate `OpportunityApplication` entity with pending/reviewed/accepted/rejected
   status, authenticated owner review, RLS and transactional notifications.
2. Dedicated competition/internship/event types and deadline + remote/location metadata.
3. Trust and abuse safeguards: moderation/reporting queue, rate limits,
   real organization verification and spam-risk checks.
4. Public shareable preview + deep links with user consent and proper access control.
5. Relevance evaluation based on opt-in matched → inquiry → collaboration outcomes;
   no automated decision on protected characteristics.
6. B2B Scout pilot: discoverable opt-in profiles, proof-backed search, saved filters,
   permissioned outreach and Rising Teams, with metrics on accepted introductions.
