# PR #19 · Social Essentials QA and next work

## Delivered
1. Private `profile-avatars` bucket. Users upload JPG/PNG/WEBP (max 3MB), edit in Settings, remove old images on replacement. Profile pictures are served only through `/api/avatar` after session + profile visibility checks.
2. Avatar rendering in personal and public Profile, Home, Explore, and Messages. Existing profile without avatar continues to display an initial.
3. Home filter **추천 / 팔로잉** with the Following option restricted to people the user follows; domain filters remain available.
4. `conversation_reads`, message-triggered `conversations.last_message_at`, server-side `inbox_overview` RPC, and read-marker RPC.
5. Inbox displays last activity order and unread counts. Realtime refreshes conversation list and new thread messages; last 100 messages are shown in threads.

## QA needed with 2+ real accounts (not fulfilled by build)
- Profile upload JPG/PNG/WEBP, reject unsupported formats and files >3MB; replace and remove, refresh after upload.
- Non-discoverable and blocked profile avatar must be denied in `/api/avatar` and direct bucket requests.
- Following feed must contain only followed authors, plus empty state with no follows.
- Conversation A↔B: send from A, B inbox should reorder, unread count should increase, open thread should mark read.
- New message to currently open thread must appear without page reload; ensure unread count doesn't remain stuck.
- Blocked DM should not receive new inserts; TEAM group conversations should still work for valid members.
- Test phone 320px/390px, tablet and desktop. No horizontal overflow, fallback initials for empty avatar.
- Explicitly test logout/access to private avatar and thread endpoints.
- Run security advisor and inspect policies + publication.

## Known limitations
- Avatar file deletion after replacing is best-effort, add an orphan cleanup job before public rollout.
- Thread loads most recent 100; older message pagination/attachments not yet implemented.
- Inbox RPC returns latest 80; large inbox keyset pagination is future work.
- Full integration tests need two actual signed-in accounts.
- Brand display remains `prof.`, all existing colors preserved.

## Next PR #20
Mixed Explore grid, save/hide actions, sharable consented public links with metadata, keyword and cursor pagination; prioritize based on small beta feedback.
