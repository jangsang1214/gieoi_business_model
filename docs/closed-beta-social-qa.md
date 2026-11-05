# GIEOI Closed Beta — Social Loop QA (PR #13)

Use two consenting test accounts **A** (TEAM owner/post author) and **B** (visitor/applicant). Do not use production customer accounts for destructive tests.

## Acceptance checks

- [ ] As B, open A's public profile, follow A, refresh; button becomes **팔로잉**.
- [ ] As A, see new follow notification in the inbox and bell count without manually refreshing while the page is open.
- [ ] As B, unfollow and refresh; Home no longer gives A the follow-weight ranking bonus. Re-follow to restore.
- [ ] As A, publish a public Record with text and an image; check Home, Explore, own profile, and Record detail.
- [ ] As B, open the Record from Explore, post a comment, then delete the comment; check no stale list.
- [ ] As A, see the comment notification; open it to return to the Record and mark it read.
- [ ] As A, delete a comment posted by B on A's Record. B should not be able to delete comments from other people's Records.
- [ ] As B, try to comment on A's private or TEAM-only record through the Data API; RLS must reject.
- [ ] As B, try to follow yourself or follow a nondiscoverable profile; RLS must reject.
- [ ] As B, apply for A's TEAM with a valid role. Verify the request appears for A.
- [ ] As A, approve; both `team_applications.status=accepted` and `team_members.status=active` must be committed. Check B gets **TEAM 합류** notification.
- [ ] As B, attempt a direct insert of `team_applications.status=accepted`; RLS must reject.
- [ ] As B, attempt to update someone else's application to accepted; RLS/trigger must reject.
- [ ] As A, review an already decided application; the UI should show a stale-state message instead of silently changing data.
- [ ] As A, create an invite for B and send a DM; B should receive instant notifications.
- [ ] On 390px and 320px mobile widths, check Home, Explore, Record detail, public profile, TEAM, inbox and notifications for horizontal overflow, unclickable buttons and clipped text.
- [ ] In a fresh browser session, verify notifications work again after reconnect and navigation.

## Verification notes

- The database migration creates `follows` and `record_comments` with ownership RLS; direct writes to `notifications` are not permitted for authenticated accounts.
- TEAM approval now uses a database trigger in the same transaction as the status update. The app only sends the status transition.
- Notifications use the `supabase_realtime` publication with recipient-filtered subscription; open-page updates should refresh the badge and inbox.
- The build/check status alone **does not** verify these browser interactions. Record tester, expected vs actual, and whether any console/network errors appeared.

## Before inviting the first external testers

1. Enable Supabase leaked-password protection in the Auth dashboard.
2. Run the checklist above with two test accounts.
3. Monitor failed Storage uploads, RLS rejects, application race errors, and notification delivery.
4. Confirm data retention and user consent for activity-event collection; don't market activity logs as ML training until a validated model exists.
