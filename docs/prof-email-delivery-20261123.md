# Prof. email signup delivery — operator checklist (2026-11-23)

## Current diagnosis

The linked Supabase project `gieoi` (`vujsypswodybgrslhpqv`) was reported
`INACTIVE` on 2026-11-23. A restore request succeeded, but the latest
observed state while this change was written was `COMING_UP`; the exact
`ACTIVE_HEALTHY` state must be confirmed separately.

A successful `signUp()` response does **not** prove that mail reached the
recipient's inbox. Supabase's default email service is restricted and
rate-limited. Real-user signup needs a configured, verified custom SMTP
sender and tested deliverability. Do not claim delivery is repaired by UI
changes alone.

## Required settings in the Supabase dashboard

1. Visit [project overview](https://supabase.com/dashboard/project/vujsypswodybgrslhpqv).
   Verify the project is `ACTIVE_HEALTHY` and its database/Auth API works.
2. **Authentication → Providers → Email**: enable email/password signups and
   confirm-email verification. Do not disable verification just to hide a
   delivery problem.
3. **Authentication → SMTP Settings**: configure a custom SMTP service
   (e.g. a provider with verified sending domain). Add and verify SPF/DKIM
   and other provider-recommended DNS records. Keep SMTP credentials in
   the Supabase dashboard, never in git or public browser variables.
4. **Authentication → URL Configuration**: set the Site URL to the current
   actual production URL:
   `https://gieoi-business-model.vercel.app`.
   Allow only trusted production auth callback URLs as required. Update
   this setting when a custom primary domain replaces the Vercel URL.
5. **Authentication → Email Templates → Confirm signup**: include the code
   variable `{{ .Token }}` if users should receive a 6-digit code. A
   suitable template example is:

   ```html
   <h2>Prof. 이메일 인증</h2>
   <p>인증번호: <strong>{{ .Token }}</strong></p>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">이메일 확인하기</a></p>
   <p>본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
   ```

   The existing server route `/auth/confirm` handles token hashes of type
   `email`. The signup screen also accepts a six-digit code via
   `verifyOtp({ email, token, type: "email" })`. Both channels can coexist.
   A default template containing only a link will **not** deliver a
   numeric code until the template is changed.
6. Confirm the Vercel project's **production** environment points to the
   correct Supabase URL and public publishable key. Never expose a
   Supabase service-role/secret key in `NEXT_PUBLIC_` variables.

## Acceptance tests — with consent and disposable accounts

- [ ] Project ACTIVE_HEALTHY; Auth endpoints reachable.
- [ ] New test account at a **non-team** email domain receives the email.
- [ ] Message contains the six-digit code, arriving in inbox or spam.
- [ ] Verify the code in the Prof. UI and confirm a signed-in session.
- [ ] A separate signup verifies using the email link.
- [ ] Request resend: client prevents repeated requests within 60 seconds;
      latest valid code can be used to finish signup.
- [ ] Login to an unverified account shows a recovery route, not a silent
      generic error.
- [ ] Rate-limit, bad-code, expired-code and SMTP failure states display
      meaningful messages without leaking account existence.
- [ ] All redirects use the legitimate production origin.
- [ ] Two-user Goal → Journey → Proof → People → TEAM → Opportunity flow
      passes in a test environment.

## References

- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/reference/javascript/auth-resend
- https://supabase.com/docs/reference/javascript/auth-verifyotp
- https://supabase.com/docs/guides/auth/redirect-urls

The code changes in this PR alone cannot configure SMTP credentials,
send a guaranteed message, or test an unrelated person's inbox.
