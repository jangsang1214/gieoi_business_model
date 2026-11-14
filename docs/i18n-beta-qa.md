# prof. Korean / English interface beta

## International acquisition readiness — phase 1

The UI now supports Korean and English **selection** on the login screen,
mobile app header, desktop rail and Settings. The selection persists in an
HttpOnly, SameSite=Lax, secure-on-production `prof_locale` cookie for one year,
without changing profile records or creating a tracking identifier.

On a new browser without an explicit preference, the first Accept-Language
value picks Korean for `ko*` and English otherwise. Users can override this
at any time. The HTML `lang` attribute follows the selected language.

The POST `/api/locale` endpoint accepts only `ko` or `en` and rejects
cross-origin requests; it doesn't let callers set arbitrary cookies or URLs.

## Core surfaces covered
- Login / email sign-up / auth errors
- Home and welcome checklist / composer and visibility controls
- App navigation, Messages inbox and thread composer
- Explore filters and empty states
- Opportunity discovery, taxonomy, matching explanations, posting and detail
- Opportunity inquiry, formal application, withdrawal, owner review, decision
- Accepted application tracking and mutual collaboration outcome
- Settings, account profile form and sign-out

**Not yet comprehensive:** all Team detail/management forms, all Profile and
Proof pages, notifications and individual safety/report sheets still contain
some Korean-only strings. The English setting is a practical beta, not a
claim of complete site-wide translation. Add those screens and legal copy
review before broad overseas paid acquisition.

User-generated records, messages, opportunities, profiles and Proof descriptions
remain **unchanged in their authored language**. No machine translation is
performed; typed opportunity tags and domain enums are displayed in
the selected language when they are app-defined.

## Testing before X/Pinterest recruitment
- [ ] A Korean-language browser with no locale cookie opens /login in Korean.
- [ ] An English-language browser with no cookie opens /login in English.
- [ ] Toggle EN on /login and confirm form fields, signup errors and document
      lang change. Reload and revisit /settings: choice persists.
- [ ] Toggle 한국어 on mobile header and Settings, verify next navigation
      remains Korean and existing user content remains unchanged.
- [ ] Home, Explore, Opportunity detail, application, DM, outcome and Settings
      show meaningful labels in English and actions still work.
- [ ] Enter Korean user posts on English UI; verify it is not automatically
      translated or modified.
- [ ] POST /api/locale with unsupported values returns 400, cross-origin
      requests return 403, and cookie uses secure options in production.
- [ ] Mobile 320/390px: header buttons and language toggle fit.
- [ ] Keyboard-only language toggle has visible focus and aria-pressed.
- [ ] PR TypeScript CI / Vercel preview deployment.
- [ ] Two-user auth/application messaging smoke test; no production test data.

## Release
Do not launch broad foreign-language paid ads until complete translation,
localized privacy/terms and auth plus two-user functional tests are reviewed.
Initial English-speaking closed beta is the next safe milestone.
