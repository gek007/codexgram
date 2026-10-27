# Codexgram visual redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the existing connected mobile app to the original fourteen supplied boards without the coffee sign-in variant.

**Architecture:** Refine shared native UI primitives, then existing feature screens. Preserve service boundaries and SDK flows; use local decorative imagery and no new dependency. Execute inline in the current codex/beta checkout, preserving unrelated cleanup as authorized in the existing session.

**Tech Stack:** Expo58, React Native0.88, Expo Router, Clerk and Convex.

**Spec:** docs/superpowers/specs/2026-10-28-codexgram-visual-redesign-design.md, approved by owner.

## Global Constraints

- Original boards01–14; no coffee hero on sign-in. No fake data, schema changes, new roles or product expansion.
- Device light/dark, accessible text/input semantics and44pt touch targets; scrolling fallback for keyboard/large text.
- Keep native photo-source dismissal ordering, drafts, quotas, upload reconciliation and engagement retention.
- Existing backend and auth flows remain connected. No new dependencies.

## Review Focus

- Long labels and larger text must wrap without hiding actions; inspect short viewport and native layout.
- Busy buttons and sheet cancellation must not create duplicate mutations; retain existing tests.
- Password mismatch must not submit a reset; add a focused form regression.
- Community success requires a real successful mutation; test rejection does not navigate and success uses returned ID.
- Empty/unauthorized data must not expose role actions or fake content; retain backend suite and inspect conditional rendering.

### Task 1 Shared components
Files: src/theme/theme-provider.tsx; src/theme/design.ts (new); src/components/ui/{button,field,screen,sheet,state-view,photo-source-sheet}.tsx; src/components/ui/action-row.tsx and illustration.tsx (new).
Interfaces: Button retains existing props, adds variant optional and icon ReactNode; ActionRow consumes label, icon Feather name, onPress, danger?, detail?; Illustration accepts kind mail|lock|key|success|photo|community|activity and size?.
- [ ] Implement board01 typography/spacing, distinct button roles, icon rows and decorative brand states. Keep existing Modal lifecycle props.
- [ ] Run UI suites to confirm disabled/loading controls and source dismissal/cancel still pass.
- [ ] Commit only owned files.

### Task 2 Original authentication and onboarding
Files: src/features/auth/auth-screen.tsx; src/features/auth/__tests__/auth-screen.test.tsx; src/app/(onboarding)/username.tsx; assets/images/welcome-collage.png (new from supplied art); src/components/ui/provider-mark.tsx (new).
Interfaces: unchanged AuthScreen continuation prop; local confirmPassword required only for newpassword mode; provider marks are decorative within labeled buttons.
- [ ] Write reset mismatch regression using mocked SDK reset steps; assert mismatch produces alert and submitPassword is not called. Observe RED.
- [ ] Implement original welcome composition, no coffee hero, compact auth forms, provider marks, tertiary links, recovery illustrations and confirmation field. Preserve SDK sequencing.
- [ ] Match username step/initials; run auth UI suite and typecheck, observe GREEN.
- [ ] Commit owned files.

### Task 3 Communities
Files: src/features/communities/{directory-screen,community-screen,create-community-screen}.tsx; src/features/communities/__tests__/create-community-screen.test.tsx.
Interfaces: success state stores returned Id<communities>; Share routes to compose with ID, Go routes to community with ID.
- [ ] Add success-state regression: successful create shows ready panel and uses returned ID only after user action; rejection retains form. Observe RED.
- [ ] Refine search/directory/onboarding rows and selection copy; overlapping cover/identity; grouped creator controls; creation form and confirmed success panel.
- [ ] Run community UI suite and typecheck; commit owned files.

### Task 4 Photos and engagement
Files: src/features/feed/{feed-screen,post-card}.tsx; src/features/posts/{composer-screen,photo-editor,comment-list}.tsx; src/features/moderation/content-menu.tsx; src/features/notifications/notifications-screen.tsx; src/app/compose.tsx.
Interfaces: services/DTOs unchanged; explicit close uses router.back and existing draft persistence; ActionRow shared for menus.
- [ ] Add explicit composer close/back, board07 preview/caption hierarchy and contrasting crop guides; retain reconciliation.
- [ ] Refine feed photo framing/metadata and counts, comment composer/edit sheet, activity rows and report options/confirmation. Fix singular accessible comment count.
- [ ] Run existing media/draft/publish/moderation/UI suites and typecheck; commit owned files.

### Task 5 Profiles settings and role views
Files: src/features/profiles/{profile-screen,account-settings-screen}.tsx; src/app/settings/blocked.tsx; src/app/admin/reports.tsx.
Interfaces: existing profile mutations and destructive confirmations unchanged; ActionRow for existing settings/role actions only.
- [ ] Match profile identity/grid, centered avatar edit and grouped account/appearance/activity/safety rows. Remove body titles duplicated by native headers; preserve destructive confirmations.
- [ ] Style existing blocked/admin rows without new capabilities; run UI/backend suite and typecheck; commit owned files.

### Task 6 Verification and delivery
Files: docs/visual-redesign-acceptance-2026-10-28.md (new); docs/beta-acceptance.md.
- [ ] Run npm run lint, npm run typecheck, npm test and native JS exports for iOS/Android.
- [ ] Inspect reachable screens in native iOS and supplementary responsive web; compare against boards. Record Android/role/provider/hardware limits precisely. Fix observed regressions.
- [ ] Obtain one fresh whole-diff review, resolve important findings, rerun affected checks and commit.
- [ ] Deliver report, implementation summary and evidence with honest remaining limits.
