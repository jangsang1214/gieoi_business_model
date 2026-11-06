# PR #16 — Explore 2.0 + lighter authentication

## What changed
- Replaced duplicate DISCOVER/OPPORTUNITY right-hand sidebar with a two-column desktop shell.
- Explore now uses the freed space for three or four columns on desktop, two on phones.
- Search for people by profile name/handle/headline/bio (discoverable profiles only); content types and interest domain filters.
- Explicit recommended/recent sorting and bounded per-type pagination; the recommendation uses simple interest, follow, and recency weights — it is *not* AI.
- Content tiles open their details; the author area independently links to the profile.
- Better first-empty state, with a direct launch of the Record composer.
- Real tabs on personal and public profiles, with visual records grid and clickable Goal/Proof/TEAM entries.
- Login focuses on a short product-oriented sentence and a clear sign-in form instead of multiple philosophical taglines.
- Fixed dead Opportunity CTA by adding `/opportunity/[id]` and linking rising TEAM entries.

## Live QA to run before inviting testers
- [ ] At 320, 390, 768, 1024, and 1440px there is no horizontal overflow, clipped search, or broken card layouts.
- [ ] At desktop Explore, the right promotional cards are absent and the main grid is wider.
- [ ] Search a discoverable user by handle and display name. Private/blocked profiles are not exposed.
- [ ] Filter Record/Person/Goal/Proof/TEAM and domains; toggle recommended/recent; page forward/back and confirm filters persist.
- [ ] Click a card body (opens detail), then author footer (opens profile).
- [ ] Create a Record with photo and text, then verify media card contrast and cropping.
- [ ] Open your profile and someone else's; switch four tabs and verify correct content/link destinations.
- [ ] Logout then check login at desktop and mobile; sign up/login, error feedback, password toggle.
- [ ] Create an Opportunity and verify its detail route opens from '기회 보기'.
- [ ] With a fresh account and empty public content, verify no fake or fabricated community activity appears.
- [ ] Validate keyboard focus, search form submission, tab ARIA and accessible labels.

## Known limitations and next work
- Pages are bounded per content type; later versions should implement stable keyset pagination and true cross-type rank paging.
- Profile search currently matches public profile text; private `direction_profiles.skill_tags` are intentionally **not indexed or exposed** for privacy.
- No live cross-account usability/E2E verification yet. Vercel build success only checks compilation/deployment.
- Current production dataset has very few profiles and no records, Goals, TEAMs or Proofs; seed a separate demo environment for visual QA and recruit consented real pilot contributors to test actual discovery.
