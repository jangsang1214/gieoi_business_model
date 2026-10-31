# 기어이 — Actual App MVP

기어이의 실제 서비스 MVP입니다. Next.js + React + Supabase SSR로 구성되어 있습니다.

## 현재 구현

- Supabase Auth: 이메일/비밀번호 회원가입, 로그인, 로그아웃
- `auth.users → profiles` 자동 생성 트리거와 연결
- Home: 실제 `records` 피드 조회
- Composer: LIFE / JOURNEY / PROOF / THOUGHT 실제 DB 저장
- PROOF 작성 시 `proofs` + `proof_provenance(self)` 생성
- TEAM: 생성, 목록, 지원, Direction Match 설명 점수
- Opportunity: open opportunity 조회/등록, Rising Team view
- Messages: Inbox → DM Thread → 실제 message 저장
- Profile: Goal, Direction Profile, Proof Vault, Collaboration Proof
- 모바일 앱 셸: 상단 app bar / 하단 5탭 / FAB / bottom sheet

## 환경변수

`.env.local`은 저장소에 커밋하지 않습니다. 로컬 또는 Vercel 환경변수에 아래 값을 설정하세요.

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
```

`service_role` 또는 secret key는 클라이언트 환경변수에 절대 넣지 않습니다.

## 실행

```bash
npm install
npm run dev
```

기본 개발 주소는 `http://localhost:3000`입니다.

## 배포 후 Auth 설정

Supabase Authentication → URL Configuration에서 Site URL과 Redirect URL을 실제 Vercel 도메인으로 설정합니다.

## 다음 우선순위

1. 프로필 편집/온보딩
2. Storage 이미지 업로드
3. TEAM 역할/지원 심사 UI
4. DM Realtime
5. 서버 계산 Direction Match 저장
6. Rising Team snapshot cron
7. Organization verification
8. GitHub/Strava integrations
