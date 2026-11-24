# Prof. commercialization execution plan — 2026-11-25

## 0. Current facts vs hypotheses

**Confirmed in the Supabase project on 2026-11-25:** 1 profile, 0 Goals, 0 Records, 0 TEAMs. Prof. therefore does not have an established marketplace or validated acquisition funnel. The Supabase project is ACTIVE_HEALTHY. A missing `authenticated INSERT` grant on `account_deletion_requests` was repaired and rechecked (RLS enabled, anonymous INSERT remains denied). This fixes *request submission*, not the full account erasure workflow.

**Unverified/blocking:** outgoing SMTP to arbitrary non-team recipients; six-digit signup email template; legal/privacy notices, actual deletion processing, two-user E2E, incident response and payment operations.

A passing Next.js build does **not** prove auth email deliverability or user willingness to pay.

## 1. Wedge and buying customer

**Free users:** students, hackathon participants, side-project builders and aspiring collaborators. Their Goal, Journey and self-declared Proof provide a *context* for an introduction, not independent credential verification.

**First paying customer hypothesis:** a university club lead, campus startup organizer, hackathon operator or accelerator that is already trying to recruit and coordinate teams. These organizations can benefit from a managed participant/recruiting workflow; this willingness to pay is NOT proven.

**One-sentence offer:** "Prof.로 프로그램 참가자·팀의 공개 활동을 확인하고 팀 모집부터 지원 검토·대화까지 한곳에서 운영하세요."

**First product:** use the EXISTING free TEAM pages, recruiting/applications and messaging. Do not pretend automated applicant ranking, employer background checks, advanced reporting or a payment portal already exist.

**Differentiation to test:** did visible evidence of real work (Goals, Journals, self-declared Proof) help an organizer make a better introduction or shortlist than an ordinary resume or form?

**Competitive context:** Gather:us, Mocozi and Team-Pik already support student/team recruiting. The category is not unique; the measurable recruiting result must be better.

## 2. Monetization — price hypotheses, not product charges

| Offer | Proposed experiment | Delivery and conditions |
|---|---|---|
| Member account / basic TEAM recruiting | Free during beta | Existing platform features; no card collection |
| Team organizer assisted pilot | **₩300,000 per 4-week cohort** (price-test hypothesis) | Founder-led onboarding, help publishing opportunities, weekly applicant review call; only after signed scope, payment/tax/legal readiness |
| Institutional event/cohort package | **₩500,000–₩1,000,000 per event** (discovery hypothesis) | Later, only after multiple successes with organizer buy-in and a clearly scoped manual service |
| Future Scout subscription | TBD | Not sellable until applicant volume, permission model, fair selection transparency and genuine utility are tested |

**Illustrative revenue, NOT forecast:** three successfully contracted ₩300,000 pilots would yield ₩900,000 gross before tax/expenses. Do not book this as revenue until paid.

Charging individual students now is likely to suppress the essential network supply. Start by charging the organizer for verifiable labor/time savings, if and only if they value it.

## 3. 4-week execution sprint (2026-11-25 to 2026-12-23)

### Days 1–3 — release gates (Nov 25–27)
- Verify Supabase project ACTIVE_HEALTHY, production project/URL/key linkage.
- Configure **custom SMTP** with an actual provider and verified domain: SPF/DKIM, sender identity, Supabase Authentication → SMTP Settings.
- Confirm-signup email template must include `{{ .Token }}` for a 6-digit code. Confirm /auth/confirm link and Auth URL Configuration.
- Test an approved disposable external (non-team) inbox: signup, resend, code, link, login, reset password; check dashboard auth logs.
- Publish accurate Terms and Privacy Policy with operator contact, retention, third parties, deletion path; establish real deletion processing and response SLA, with legal review.
- Test two separate accounts creating GOAL → JOURNEY → PROOF, TEAM application/acceptance, Opportunity, DM and data access isolation.
- If one item blocks, **do not claim full public launch readiness**.

### Days 4–10 — talk to buyers (Nov 28–Dec 4)
- Reach out to **20 targeted organizers**, not 1,000 random students. Examples: university startup clubs, event teams, hackathon organizers. Do not spam or scrape private contact lists.
- Target **8 buyer calls**, record current process, hiring pain, current tools, volume, timing and budget owner. Ask for permission before follow-up.
- Recruit **3–5 pilot organizers** and ~30 participants *only once email/legal gates pass*. Give each organizer one concrete setup task (publish a TEAM + a real role).

### Days 11–17 — activation (Dec 5–11)
- Target >=10 genuine teams / recruiting listings and >=30 users with a completed Goal or Journey (stretch goals, not predictions).
- Review broken steps and solve them before adding any generic AI feature.
- Measure first record in 24h, first follow/DM/team application in 7 days, team application review turnaround and weekly active organizers.
- User data belongs to the users; do not seed fake profiles, fake Proof or fake team activity.

### Days 18–29 — revenue validation (Dec 12–23)
- Offer a carefully scoped **4-week organizer support pilot** to satisfied pilot leaders.
- Price-test ₩300,000 only in direct conversation after confirming who pays, what is delivered and what happens if recruitment fails.
- Target **2 written paid pilot agreements** as a stretch objective. If nobody will pay, record the objections and adapt the customer or service offer; do not disguise free trials as paying customers.
- If payment readiness is incomplete, collect nonbinding letters of intent (not card details or deposits) and defer charges.

## 4. Actual acquisition script (Korean)

**Initial DM/email subject:** 해커톤·프로젝트 팀원 모집 운영 관련 15분 인터뷰 요청

안녕하세요. 프로젝트 팀원 모집 과정에서 지원자 검토와 팀 구성에 어떤 어려움이 있는지 조사하고 있습니다. 저는 Goal·활동 기록·성과를 바탕으로 팀원을 찾는 Prof.를 개발하고 있습니다.

현재 TEAM 모집과 지원 검토 기능을 테스트 중인데, 실제 운영자 입장에서 15분 정도 의견을 들을 수 있을까요? 제품 판매보다 지금 모집 과정의 불편함과 개선 기준을 확인하려는 인터뷰입니다. 원하시면 기능도 짧게 보여드리겠습니다.

**After successful free beta:**
참가자 활동 기록과 TEAM 지원 과정을 함께 운영해 본 뒤, 이번 프로그램에서 반복적으로 생기는 모집·지원자 검토 업무를 4주 동안 직접 지원하는 유료 파일럿을 제안드리고 싶습니다. 어떤 업무에 가장 도움이 되는지, 예산 승인 주체는 누구인지 먼저 확인하고 범위와 가격을 정식으로 안내드리겠습니다.

Never assert that the person is already an approved customer or that any feature not actually working is available.

## 5. Founder-led interview questions

1. 지난 3개월 동안 프로젝트·행사 팀원 모집을 몇 번 진행했고, 가장 느렸던 단계는 무엇인가요?
2. 기존 도구(폼·SNS·커뮤니티)에서 지원자를 검토할 때 무엇을 확인하지 못하나요?
3. 지원자의 Goal/작업 기록/성과를 실제로 보면 어떤 결정을 바꾸게 되나요?
4. 팀원 모집 운영에 시간을 얼마나 쓰며 누가 그 업무를 맡나요?
5. 4주 동안 모집 운영 보조가 가능하다면 어느 업무에 **비용을 지불할 의향**이 있나요? 실제 구매 승인자는 누구인가요?

## 6. Validation metrics — actual public tables

Review data in aggregated form with authorized operator access. Never expose raw profiles/messages or import private data into spreadsheets.

```sql
select 'profiles' metric, count(*)::int value from public.profiles
union all select 'goals',count(*)::int from public.goals
union all select 'records',count(*)::int from public.records
union all select 'teams',count(*)::int from public.teams
union all select 'follows',count(*)::int from public.follows
union all select 'team_applications',count(*)::int from public.team_applications
union all select 'opportunity_applications',count(*)::int from public.opportunity_applications
union all select 'messages',count(*)::int from public.messages;
```

Activation can be calculated by distinct owner/author IDs in `profiles`, `goals`, and `records`. Team effectiveness needs verified conversions beyond event impressions. Explicitly track the count of accepted/meaningful introductions *with consent*; do not infer collaboration from a page view.

## 7. Decision gates

- **Proceed with beta recruitment**: 2-user E2E pass; real signup emails delivered; legal information published; deletion request and processing verified.
- **Proceed with paid concierge service**: the above + organizer consent and contract, service scope/deliverables, business registration/tax handling as applicable, lawful invoicing and payment collection.
- **Invest in paid SaaS features**: >=3 organizers who have *paid* and used the service again, plus evidence that the software (not just founder labor) creates the value.
- **Stop/pivot**: after 20 organizer interviews and 5 active pilots, no meaningful recruiting advantage or no buyer willing to pay. Adjust buyer/offer rather than adding generic features.

## 8. Current execution status

- Implemented a public, honest early-beta landing page at `/for-teams`. It advertises only existing functionality and no payment.
- Fixed existing account deletion-request table INSERT grant with row-level access restrictions preserved.
- Email SMTP/template cannot be written through the current connected Supabase actions. **Manual dashboard action and provider/domain credentials remain required.**
- No outbound sales messages sent, no contracts signed, and no revenue collected yet.

## References for operator validation

- Supabase SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- Auth Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- Korean PIPA art. 30: https://www.law.go.kr/lsInfoP.do?lsiSeq=289415
- Korea Government24 telecommunications sales report: https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=11300000006
