# Codexgram Beta Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The user has not selected an execution method yet; this document authorizes no implementation or paid service action by itself.

**Goal:** Build the agreed photo-community beta for iOS and Android with Clerk email/password, Google and Facebook authentication, Convex data/storage, and QR opening of installed development builds.

**Architecture:** Custom Expo Router screens consume authenticated Convex queries/mutations through `ConvexProviderWithClerk`. Backend functions own permissions, quotas, media ownership, moderation and notification events; local draft storage owns retry state. Use a Convex HTTP action for authenticated, bounded photo ingestion and EAS development builds for OAuth callbacks.

**Tech Stack:** Expo SDK 58, React Native 0.88, React 19.3, Expo Router 58; Clerk Expo SDK, Convex; Expo image picker/manipulator/file-system/secure-store/auth-session/dev-client; Vitest + convex-test for server rules, Jest Expo + React Native Testing Library for consequential client flows.

**Spec:** [Codexgram beta specification](../specs/2026-10-27-codexgram-beta-design.md). Read its confirmed requirements, assumptions, and risks before implementation.

## Global Constraints

- Both iOS and Android; English-only; bold/playful styling with light and dark modes.
- Clerk: email/password, Google, Facebook. Convex: data, authorization, file storage.
- One photo and optional caption per post. Members only may post. All communities public to authenticated users.
- **10 posts per user per day**; quotas enforced server-side, UTC reset as a planner default.
- Installed development builds with QR opening; Expo Go is not the full-beta runtime. Push stays deferred; likes/comments generate in-app notifications only.
- Free tiers first; no ads or billing. Record actual limits during setup; no spending authorization inferred.
- Keep screens in `src/app/`; components/hooks/utilities outside it. No manual native project edits.
- This repository has `package-lock.json`, no Bun lock. Use `npx expo install` for dependencies and `npx eas-cli@latest` for EAS commands. Recheck if lockfiles change.
- Preserve existing uncommitted edits/deletions. Never reset the workspace or commit someone else's files with `git add .`.
- Refresh SDK 58 and provider docs at execution; lock resolved package versions. Run `npx expo lint` and `npx tsc --noEmit` before completion.

## Current repository and checked documentation

Observed 2026-10-27: `src/app/_layout.tsx` contains a Stack; `src/app/index.tsx` is a placeholder. No auth/backend/testing implementation exists. Many starter files are already deleted or modified by the user. `docs/PLAN MODE PROMPT.md` records the interview prompt and must remain untouched.

Installed lockfile versions: `expo@58.0.20`, `expo-router@58.0.27`, `react@19.3.0`, `react-native@0.88.0`. Registry checks returned `@clerk/expo@4.14.2` (Expo peer range `>=54 <59`) and `convex@1.48.0`; these are researched candidates, not installed dependencies. Check exact compatibility at installation; do not migrate SDKs silently.

Baseline checks during planning: `npx tsc --noEmit` fails because the root include pattern also typechecks ignored archived starter code in `example/`, whose imports point to removed components. `CI=1 npx expo lint` finds no config and tries to install tooling, then reports an ESLint-version detection error. That incidental tooling/config was removed after the check; dependency file diff sizes returned to their pre-check values. Task 1 must configure lint explicitly and exclude `example/` from active type/lint scope without deleting the archive. These are recorded failures, not passing validation.

Relevant primary sources checked through Context7 and official docs:

- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [ImagePicker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/), [ImageManipulator](https://docs.expo.dev/versions/v58.0.0/sdk/imagemanipulator/): use compatible modules for capture/library and image transforms.
- [Expo OAuth](https://docs.expo.dev/guides/authentication/): supported OAuth testing requires an application scheme and development build. [Development-build QR use](https://docs.expo.dev/develop/development-builds/use-development-builds/): install the build first, then open the server using its QR code.
- [Clerk Expo quickstart](https://clerk.com/docs/expo/getting-started/quickstart): custom React Native auth UI and secure token caching. [Clerk OAuth flow source](https://github.com/clerk/clerk-docs/blob/main/docs/guides/development/custom-flows/authentication/oauth-connections.mdx): `useSSO`, `startSSOFlow`, callback allowlisting and incomplete sign-in/sign-up handling. [Facebook setup](https://clerk.com/docs/guides/configure/auth-strategies/social-connections/facebook): development versus production credentials.
- [Convex Clerk integration](https://docs.convex.dev/auth/clerk), [HTTP actions](https://docs.convex.dev/functions/http-actions), [file upload](https://docs.convex.dev/file-storage/upload-files), [convex-test](https://docs.convex.dev/testing/convex-test).
- [Expo Jest setup](https://docs.expo.dev/develop/unit-testing/). Use Vitest only for backend/pure tests; do not load native React Native modules into its edge runtime.

## Review Focus

1. A response is lost after publish commits: retry returns the existing post and charges no second quota unit (Task 5).
2. A blocked author's content remains reachable by ID, a stale notification, profile, or an old feed cursor: every route rechecks visibility (Tasks 6–8).
3. OAuth cancellation, Facebook without an email, or an existing email/password account: no duplicate Convex identity and no premature onboarding (Tasks 2–3).
4. A giant/invalid photo or a reused foreign media ID: reject without orphan accumulation or ownership bypass (Task 4).
5. A live join/ban/deletion happens while a screen is open: server revalidates the write, and the client explains the denial without losing the draft (Tasks 5–9).

## File boundaries and shared contracts

| Area | Planned files | Responsibility |
| --- | --- | --- |
| Runtime/theme | `src/providers/app-providers.tsx`, `src/theme/{tokens,theme-provider}.tsx`, `src/components/ui/{button,field,screen,state-view}.tsx` | Providers, theme, reusable accessible controls |
| Auth | `src/app/(auth)/{_layout,sign-in,sign-up,verify-email,forgot-password,continue}.tsx`, `src/features/auth/{auth-form,oauth-buttons}.tsx`, `src/features/auth/use-social-auth.ts` | Clerk sessions and resumable auth requirements |
| Main routes | `src/app/(tabs)/{_layout,index,discover,notifications,profile}.tsx`, `src/app/(onboarding)/{_layout,username,communities}.tsx` | Home/discovery/notifications/profile tabs and onboarding |
| Detail routes | `src/app/community/[communityId].tsx`, `src/app/community/create.tsx`, `src/app/post/[postId].tsx`, `src/app/post/edit/[postId].tsx`, `src/app/user/[userId].tsx`, `src/app/compose.tsx`, `src/app/settings/{index,blocked}.tsx`, `src/app/admin/reports.tsx` | Thin route adapters to feature screens |
| Feature UI | `src/features/{communities,feed,posts,profiles,notifications,moderation}/` | Screens, list items, editor and permission-aware actions |
| Shared client logic | `src/lib/{convex,errors}.ts`, `src/features/posts/{draft-store,media,upload,use-publish}.ts` | One Convex client, safe errors, durable draft/media pipeline |
| Backend | `convex/{schema,auth.config,users,communities,posts,comments,likes,notifications,moderation,media,http,maintenance,accounts,crons}.ts`, `convex/lib/{auth,access,validation,limits}.ts` | Validated public/internal endpoints and policies |
| Checks/delivery | `vitest.config.mts`, `jest.config.cjs`, `eslint.config.js`, `eas.json`, `.env.example`, `.github/workflows/checks.yml`, `docs/beta-testing.md` | Repeatable checks and device instructions |

Use generated Convex `Id<"table">` and `Doc<"table">` types. Public API names below are contracts, not pre-existing functions. All mutation return types are asynchronous. Queries use generated validators and return typed DTOs, never raw auth tokens or internal records.

- `Page<T> = { page: T[]; continueCursor: string; isDone: boolean }`; `PageArgs = { cursor: string | null; numItems: number }`, clamp source page size to 30.
- `PostCard = { id: Id<"posts">; communityId: Id<"communities">; authorId: Id<"users">; username: string; photoUrl: string; width: number; height: number; caption?: string; createdAt: number; editedAt?: number; likeCount: number; commentCount: number; likedByMe: boolean; canEdit: boolean; canModerate: boolean }`.
- `ProfileView = { id: Id<"users">; username: string; bio: string; avatarUrl: string | null; isMe: boolean }`.
- `CommunityView = { id: Id<"communities">; name: string; handle: string; description: string; accent: string; creatorId: Id<"users">; joined: boolean; canPost: boolean; canModerate: boolean }`.
- `CommentView = { id: Id<"comments">; authorId: Id<"users">; username: string; text: string; createdAt: number; editedAt?: number; canEdit: boolean; canModerate: boolean }`.
- `NotificationView = { id: Id<"notifications">; kind: "like" | "comment"; actorUsername: string; postId: Id<"posts">; createdAt: number; readAt?: number }`.
- `UserSession = { id: Id<"users">; username?: string; onboardingComplete: boolean; status: "active" | "deleting" | "suspended" | "deleted" }`; the client never receives Clerk credentials from this DTO.
- Error codes: `UNAUTHENTICATED`, `ONBOARDING_REQUIRED`, `FORBIDDEN`, `NOT_FOUND`, `BLOCKED`, `BANNED`, `VALIDATION`, `USERNAME_TAKEN`, `HANDLE_TAKEN`, `QUOTA_EXCEEDED`, `UPLOAD_REJECTED`, `ACCOUNT_UNAVAILABLE`. Provide safe English display messages; do not expose stack traces.

For each task: write the listed behavioral test first, run it and observe the expected failure, implement the contract, rerun it until green, then commit only that task's files after reviewing the diff. Do not manufacture failures with dummy assertions. Device verification supplements, rather than substitutes for, backend permission tests.

### Task 1: Establish a running themed application and repeatable checks

**Files:** Modify `package.json`, `package-lock.json`, `src/app/_layout.tsx`, `src/app/index.tsx`, `app.json`, `.gitignore`, `tsconfig.json`; create the runtime/theme/UI files above, `vitest.config.mts`, `jest.config.cjs`, `eslint.config.js`, `.env.example`, `src/components/ui/__tests__/button.test.tsx`.

**Interfaces:** Produce `AppProviders({children})`, `ThemeProvider({children})`, `useTheme()`, and shared `Button({label,onPress,disabled?,loading?})`, `Field`, `Screen`, `StateView`. `useTheme()` supplies resolved light/dark tokens; no network calls from UI primitives.

- [ ] Record `git status --short` and baseline checks; preserve user work. Read current skill/API guidance before code. Install only Expo-compatible required runtime packages and dev test/lint packages using `npx expo install ...` (`--dev` for dev packages). Do not install optional native Clerk sign-in SDKs; use the browser OAuth flow.
- [ ] Add scripts `typecheck: tsc --noEmit`, `test:backend: vitest run`, `test:ui: jest --runInBand`. Scope Vitest to `convex/**/*.test.ts` plus pure client tests with node runtime; Jest to `src/**/*.test.tsx` with `jest-expo`. Isolate test globals and include Vite glob types for backend test setup. Exclude archived `example/` and generated/native outputs from active lint/type/test scope. Resolve Expo CLI's ESLint detection against the installed compatible package, then rerun the required lint command.
- [ ] Write `button.test.tsx`: pressing an enabled labelled button invokes its handler once; disabled/loading buttons invoke it zero times; accessible disabled state matches. Run `npm run test:ui -- button.test.tsx` and observe the missing component failure.
- [ ] Implement controls and theme tokens: warm neutral canvas, violet primary action, coral/teal accents, large photo areas and colorful community chips. Choose distinct foreground tokens for both appearances and test contrast while styling. Use platform-neutral icons; avoid iOS-only symbols for essential Android controls.
- [ ] Add `.env.example` placeholders: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`, `EXPO_PUBLIC_CONVEX_URL`, `EXPO_PUBLIC_CONVEX_SITE_URL`; document backend-only `CLERK_JWT_ISSUER_DOMAIN`, `CLERK_SECRET_KEY`, `APP_ADMIN_CLERK_IDS`. Ignore real `.env*` files while allowing the example. No secrets in `EXPO_PUBLIC_*`.
- [ ] Run the focused UI test, `npx expo lint`, `npx tsc --noEmit`, and `npx expo-doctor`. Resolve newly introduced failures; record baseline failures separately. Open the app on both platforms to confirm theme and safe areas. Commit: `chore: establish mobile app foundation`.

### Task 2: Authenticate with Clerk and establish backend identity

**Files:** Create auth routes/features, `src/providers/app-providers.tsx`, `src/lib/convex.ts`, `convex/{schema,auth.config,users}.ts`, `convex/lib/auth.ts`, `convex/users.test.ts`, `convex/test.setup.ts`, `src/features/auth/__tests__/auth-flow.test.tsx`.

**Interfaces:** `users.ensureCurrent(): Id<"users">` idempotently upserts by authenticated issuer/subject; `users.me(): UserSession | null`. `requireUser(ctx: QueryCtx | MutationCtx): Promise<Doc<"users">>` rejects absent/inactive identity. HTTP actions use authenticated identity and internal query/mutation calls instead of assuming direct database access. `useSocialAuth().start(provider: "google" | "facebook"): Promise<void>` completes the Clerk session or navigates to `/continue`.

- [ ] Set up `convex-test` identity fixtures and generated modules with the initial users schema and identity index; Task 3 extends the schema to the remaining domains. Write `users.test.ts`: unauthenticated upsert rejects, repeated upsert gives one ID, two Clerk subjects with the same supplied display email do not merge, suspended/deleting users are denied. Observe failure with `npm run test:backend -- convex/users.test.ts`.
- [ ] Configure Clerk/Convex integration: Clerk provider outside `ConvexProviderWithClerk`, matching `useAuth` from the installed `@clerk/expo`, secure token cache, JWT issuer/audience from documented Clerk integration. Create one `ConvexReactClient` outside render. Wait for Convex auth confirmation before protected queries.
- [ ] Implement custom email/password sign-up/sign-in, email code verification, password recovery, sign-out and session restoration with the installed Clerk API. Handle verification/client-trust/session-task states, not only the happy path. Upsert the app user only after Clerk and Convex authentication succeed.
- [ ] Add Google/Facebook buttons using `useSSO().startSSOFlow`, `oauth_google`/`oauth_facebook`, `AuthSession.makeRedirectUri({scheme:"codexgram",path:"continue"})` and browser completion handling. Register the **actual generated URI** in Clerk; configure both providers in the intended instance. Keep provider secrets in Clerk. Do not hand-roll token exchange or merge users by email.
- [ ] Write/run `auth-flow.test.tsx`: cancelled OAuth stays signed out and reenables buttons; missing provider email/session tasks opens continuation; completed OAuth activates once; expired/rejected credentials show recoverable errors. Rerun backend/UI tests. Device OAuth execution waits for Task 10's installed builds, not an Expo Go result. Commit: `feat: add Clerk authentication and Convex identity`.

### Task 3: Onboard users and create/join public communities

**Files:** Create onboarding and community routes/features; extend `convex/{schema,users,communities}.ts`; create `convex/lib/validation.ts`, `convex/communities.test.ts`, `src/features/communities/__tests__/onboarding.test.tsx`.

**Interfaces:** `users.setUsername({username}): void`; `users.completeOnboarding(): void`; `communities.create({name,handle,description,accent}): Id<"communities">`; `communities.list({search?,paginationOpts:PageArgs}): Page<CommunityView>`; `communities.get({communityId}): CommunityView | null`; `communities.join/leave({communityId}): void`.

- [ ] Define indexed schema for all records from the spec before other domains use them. Enforce uniqueness transactionally using indexed lookups; Convex indexes alone are not unique constraints. Add compound indexes for user identity/username, community handle, memberships by user/community and by pair, plus domain indexes required in Tasks 4–9.
- [ ] Write tests: case-normalized username/handle collision rejects; creator auto-joins; join retries do not duplicate membership; onboarding without a join rejects; creator cannot leave; a banned account cannot join; empty and populated directory searches paginate. Run the focused backend suite and observe failure.
- [ ] Implement server validation and routes. Directory: alphabetical name index for browse, name search index for non-empty search. Start with name token search, not a promised substring engine. Onboarding collects username then joins; returning sessions skip completed steps.
- [ ] Test a client recovering from a taken username and a failed join without discarding entries. Verify keyboard avoidance, loading, empty/error states and theme. Rerun focused tests and commit: `feat: add profiles onboarding and public communities`.

### Task 4: Capture, edit, upload and retain owned photo drafts

**Files:** Create `src/features/posts/{media,draft-store,upload}.ts`, `src/features/posts/{photo-editor,composer-screen}.tsx`, `src/app/compose.tsx`; create `convex/{media,http,maintenance,crons}.ts`, `convex/lib/limits.ts`, `convex/media.test.ts`, `src/features/posts/draft-store.test.ts`, `src/features/posts/__tests__/composer.test.tsx`.

**Interfaces:** `Draft = { version:1; ownerId:Id<"users">; requestId:string; communityId?:Id<"communities">; postId?:Id<"posts">; caption:string; localPhotoUri?:string; width?:number; height?:number; uploadedAssetId?:Id<"mediaAssets">; updatedAt:number }`. `saveDraft(draft):Promise<void>`, `loadDraft(ownerId):Promise<Draft|null>`, `clearDraft(ownerId):Promise<void>`. `preparePhoto(uri,crop,quarterTurns):Promise<{uri:string;width:number;height:number}>`. `uploadPhoto({uri,purpose,requestId,getToken}):Promise<Id<"mediaAssets">>`.

- [ ] Write tests for draft restart recovery/account isolation, picker cancellation, camera denial, network failure retaining photo/caption, invalid bytes, >5 MiB body, foreign asset reuse, and repeating an upload request ID. Run them before implementing.
- [ ] Use SDK 58 ImagePicker for library/camera and ImageManipulator's current context API for rotation/crop/JPEG resize. Build a simple square crop editor shared by both platforms rather than depending on differing native editing tools. Client preparation ≤1,600 px, JPEG quality 0.8; server cap 5 MiB.
- [ ] Persist draft JSON and the prepared photo in account-scoped **document storage**, not temporary picker/cache locations. Use SDK 58 FileSystem APIs and atomic metadata replacement. Never persist tokens/passwords with the draft. Clear local draft on successful publish or account sign-out.
- [ ] Implement `POST /media/upload` as an authenticated Convex HTTP action, receiving purpose/request ID and JPEG bytes with a Clerk JWT. Read request bytes with a hard limit, verify declared type and JPEG signature, and reject unsupported images. Use `ctx.auth.getUserIdentity()` and internal functions for authorization/quota reservations. The action stores the blob and records its owner via an internal mutation; it returns an application media asset ID, never accepts an arbitrary client-owned storage ID.
- [ ] Reserve/reconcile upload requests and daily upload quotas transactionally; repeated successful request IDs return their existing asset. Associate pending IDs with the uploader and intended purpose, enforce expiry, and delete a newly stored blob if registration fails. Retry can reuse an existing pending asset. Configure bounded hourly cleanup of unattached assets older than 24 hours and expired reservations; paginate cleanup and retry failed storage deletions.
- [ ] Run focused backend/pure/UI tests. On iOS and Android test rotated portrait photos, permission denial, picker cancel, a large image, restart, and airplane-mode retry. Commit: `feat: add photo editing and durable upload drafts`.

### Task 5: Publish, edit and delete posts with quotas and retry safety

**Files:** Create `convex/posts.ts`, `convex/posts.test.ts`, `convex/lib/access.ts`, `src/features/posts/use-publish.ts`, `src/features/posts/__tests__/publish.test.tsx`, `src/app/post/{[postId],edit/[postId]}.tsx`; extend composer and media functions.

**Interfaces:** `posts.create({communityId,assetId,caption?,requestId}):Id<"posts">`; `posts.update({postId,caption?,assetId?,expectedRevision:number}):void`; `posts.remove({postId}):void`; `posts.get({postId}):PostCard|null`. `canViewAuthor(ctx,viewerId,authorId):Promise<boolean>` checks either block direction and account state. `requireCanInteract(ctx,postId):Promise<{viewer:Doc<"users">;post:Doc<"posts">}>` checks active post/community, membership, ban, blocks and active author.

- [ ] Write tests: outsider/banned member cannot post; 10 successful posts pass, the 11th rejects; deletion does not restore daily allowance; retry after a committed response loss returns the same ID; concurrent attempts cannot overrun quota; UTC midnight resets; foreign/attached/wrong-purpose media reject. Observe failure with `npm run test:backend -- convex/posts.test.ts`.
- [ ] Implement one transactional create: authenticate → look up `(author,requestId)` before quota → validate current community access and owned pending media → increment day counter → attach media → insert post. A reused request ID with different input rejects instead of silently creating another result.
- [ ] Implement author-only editing/replacement with optimistic revision checks. Keep post ID, creation time, likes/comments; increment revision/set edited timestamp. Caption-only edits are allowed; replacement swaps owned media atomically, then schedules old media deletion. Concurrent stale edits return a conflict message and preserve the local draft. Soft-delete posts immediately from reads and process comments/likes/notifications/media cleanup in bounded batches.
- [ ] Write client tests for successful retry clearing a draft once, failed publish keeping it, and a ban arriving after upload preserving the draft. Build post detail/edit/delete controls; refresh permitted actions from backend DTOs. Rerun tests and commit: `feat: add transactional photo posts and editing`.

### Task 6: Serve live home, community and profile feeds

**Files:** Create tab routes, profile detail routes, `src/features/feed/{feed-screen,post-card}.tsx`, `src/features/communities/community-screen.tsx`, `src/features/profiles/{profile-screen,edit-profile-screen}.tsx`, `convex/feed.ts`, `convex/feed.test.ts`; extend `convex/users.ts`, `src/app/settings/index.tsx`.

**Interfaces:** `feed.home({paginationOpts}):Page<PostCard>`; `feed.community({communityId,paginationOpts}):Page<PostCard>`; `feed.profile({userId,paginationOpts}):Page<PostCard>`; `users.profile({userId}):ProfileView|null`; `users.updateProfile({bio,avatarAssetId?}):void`. Backend assembles `PostCard` with the shared access policy; home alone requires membership for inclusion.

- [ ] Write tests that home excludes unjoined communities, community/profile can browse permitted public posts, pages remain newest-first without duplicate IDs, and direct post/profile access obeys the same blocks as feed results. Add an empty filtered page with `isDone:false` followed by a visible page; it must not falsely signal feed exhaustion.
- [ ] Implement bounded source pagination: home scans the newest active source posts in batches of 30 and filters each batch using indexed viewer membership/block checks. Preserve the source `continueCursor`/`isDone`; never collect the complete posts table. Community/author feeds use their specific indexes. Accept short pages for this small beta and record sparse-page read costs as an expansion risk.
- [ ] Use reactive Convex pagination with virtualized `FlatList`, stable IDs, appropriate image aspect ratio, image caching and deduplication. Offer load-more even when a source page filters to zero; cap automatic empty-page advances at three per user gesture. Reset pagination when viewer/community changes; do not treat a cached `canEdit` as authorization.
- [ ] Implement avatar/bio edit and profile grids; route other users' posts through the same viewer policies. Empty home after leaving all communities links to Discover. Include error/retry and image-unavailable states.
- [ ] Run focused backend tests and manually check two accounts on separate platforms for reactive posts, joins/leaves, pagination, large text and dark mode. Commit: `feat: add reactive community feeds and profiles`.

### Task 7: Add likes, flat comments and in-app notifications

**Files:** Create `convex/{likes,comments,notifications}.ts`, `convex/engagement.test.ts`, `src/features/posts/comment-list.tsx`, `src/features/notifications/notifications-screen.tsx`, `src/features/notifications/__tests__/notifications.test.tsx`; wire post detail and notifications tab.

**Interfaces:** `likes.set({postId,liked:boolean}):void`; `comments.create({postId,text,requestId}):Id<"comments">`; `comments.update({commentId,text}):void`; `comments.remove({commentId}):void`; `comments.list({postId,paginationOpts}):Page<CommentView>`; `notifications.list({paginationOpts}):Page<NotificationView>`; `notifications.markRead({notificationId}):void`; internal `notifications.record({recipientId,actorId,postId,commentId?,kind,eventKey}):void`.

- [ ] Write tests: idempotent like state/counter, request-ID-safe comment create, author-only edit/delete, no self notification, unlike/re-like does not create repeated notification, comment edits emit none, read markers belong to recipient, blocked/banned users cannot interact, deleted targets do not expose content through notifications.
- [ ] Implement interaction rules with `requireCanInteract`; list comments chronologically with indexed pagination and block filtering. Atomically update like/comment counters and record notification events. Counts are aggregate post activity; comment rows remain viewer-filtered.
- [ ] Implement optimistic like state with rollback and repeated-submit prevention for comments. Preserve unsent comment text on failure. Notification lists filter blocked actors and unavailable posts; opening a stale item shows a generic unavailable screen and marks only the current user's item read.
- [ ] Run backend/UI tests and check real-time engagement across two accounts. Verify no notification-permission request, push token registration or `expo-notifications` dependency is added. Commit: `feat: add engagement and in-app notifications`.

### Task 8: Add reporting, blocking and creator/admin moderation

**Files:** Create `convex/moderation.ts`, `convex/moderation.test.ts`, `src/features/moderation/{report-sheet,content-menu,creator-tools,admin-reports-screen}.tsx`, `src/app/settings/blocked.tsx`, `src/app/admin/reports.tsx`; extend all visibility-sensitive backend functions.

**Interfaces:** `Target = {type:"post";id:Id<"posts">}|{type:"comment";id:Id<"comments">}|{type:"user";id:Id<"users">}`; `moderation.report({target,reason}):Id<"reports">`; `moderation.block/unblock({userId}):void`; `moderation.blocked({paginationOpts}):Page<ProfileView>` (management exception to hidden profile rules); `moderation.ban/unban({communityId,userId}):void`; `moderation.removeContent({target,reason}):void` (post/comment targets only); `moderation.listReports({paginationOpts}):Page<ReportView>`; `moderation.resolveReport({reportId,decision:"dismiss"|"remove"|"suspend"}):void`. `ReportView` contains report ID, typed target, reason, reporter ID, created time and status; only admins receive it.

- [ ] Write permission tests before implementation: ordinary member cannot moderate, creator only controls their community, admin can review reports, client role spoofing fails, self-block/self-ban rejects, other community bans do not spill over. Removal/suspension blocks stale writes immediately.
- [ ] Add a matrix test with a block in each direction: home/community/profile/posts.get/comments/notifications return no hidden content; likes/comments/create writes deny; unblocking restores visibility. Report/moderation access is an explicit audited permission exception, not a public bypass.
- [ ] Implement status-first removal and bounded media cleanup, server-validated creator roles and configured admin allowlist. Reports can be read only by their authorized submitter through acknowledgement and by admins through the review inbox. Store actor/target/action/time for moderation decisions; avoid logging full private report text into console output.
- [ ] Add report/block actions, confirmation for destructive content removal, unblocking, creator tools and a restricted admin inbox. Hide blocked content reactively and invalidate old route results. Community metadata remains discoverable; hidden posts do not.
- [ ] Run the permission matrix and focused UI tests; manually verify admin/creator/member controls using distinct accounts. Commit: `feat: add reports blocking and moderation`.

### Task 9: Complete account lifecycle and operational cleanup

**Files:** Create `convex/accounts.ts`, `convex/accounts.test.ts`, `src/features/profiles/account-settings-screen.tsx`; extend `convex/{maintenance,crons,http}.ts`, `src/app/settings/index.tsx`, client sign-out draft handling.

**Interfaces:** `accounts.requestDeletion():Id<"deletionJobs">` sets account status to deleting in the same mutation; internal `accounts.runDeletionBatch({jobId}):void` removes at most 50 related records per phase and reschedules; internal action `accounts.deleteClerkIdentity({jobId}):void` uses backend-only credentials and treats an already-missing Clerk user as success. Internal Clerk webhook handling verifies the documented signature before routing an externally deleted user into the same cleanup process.

- [ ] Write tests: deletion immediately denies all writes, repeated requests reuse the job, cleanup resumes without restoring access, media and engagement disappear, creator communities archive, Clerk deletion retry is safe, invalid webhook signatures fail. Process many records over multiple batches, not a single `.collect()` deletion.
- [ ] Implement staged removal of authored posts/comments/likes/notifications, memberships/blocks/bans/reports containing identifying data, owned media, and profile fields. Preserve only the minimal pseudonymous job marker required for retries. Update affected counters and skip already-removed records safely. Never accept a user ID from the client as proof of deletion authority.
- [ ] Build explicit in-app account-deletion confirmation and progress/error messaging; after accepting the deletion request sign out and clear local drafts. Sign-out alone retains published content. Test background/foreground and expired-session transitions.
- [ ] Verify hourly orphan cleanup is bounded, has retryable failure states, and cannot delete an attached post/avatar asset. Log codes and job IDs without passwords, tokens, provider payloads or photo bytes. Run focused tests and commit: `feat: finish account lifecycle and cleanup`.

### Task 10: Install development builds, verify OAuth and prepare the beta handoff

**Files:** Create `eas.json`, `.github/workflows/checks.yml`, `docs/beta-testing.md`; modify `app.json`, `package.json`, `README.md`; create `docs/beta-acceptance.md` as a recorded result sheet, not prefilled passing evidence.

**Interfaces:** Development EAS profile has `developmentClient:true` and internal distribution, Android APK, iOS device signing; optional separate simulator profile. Keep scheme `codexgram`; choose final iOS bundle ID/Android application ID from the owner's organization rather than inventing one. `npm run start:dev` invokes `expo start --dev-client`.

- [ ] Configure `expo-dev-client`, SDK-compatible native modules/config plugins and permission strings in app config. Keep unused microphone permission disabled for photo-only capture. Do not create/edit native project directories manually. Remove the stale reset-project script reference after verifying the file was already deleted by the user.
- [ ] Check Expo/EAS, Clerk and Convex account access; document missing access instead of creating duplicate projects. Configure separate dev/beta endpoints and auth callback allowlists, Clerk JWT settings, Google/Facebook connections and the admin allowlist. Verify real provider availability and no exposed secret in bundle/config exports.
- [ ] Inspect actual free-tier/build capacity and iOS signing requirements. No paid enrollment or new charges without explicit spending authorization. Register beta iOS devices as required; record which devices are included. Use `npx eas-cli@latest build --profile development --platform ios` and the Android equivalent only after prerequisites and build execution are authorized; do not submit to stores.
- [ ] Install finished builds on real iOS and Android devices; run `npx expo start --dev-client`. Verify a QR scan opens the project in the installed app, including OAuth callback restoration after browser cancel, successful Google sign-in, successful Facebook sign-in and email/password session restoration. If LAN is unsuitable, explicitly configure a reachable tunnel and record its dependency/availability; a development server must remain running.
- [ ] Write the beta runbook with install-once → start server → scan QR → sign in. Distinguish the build-install link/QR from the running-project QR. Explain rebuild requirements after native dependency/config changes. Include troubleshooting for expired server links, callback allowlists, denied photo/camera permissions and unregistered iOS devices.
- [ ] Configure CI to run lockfile install, lint, typecheck and both test suites without production secrets. Backend tests use fixtures; never point CI's test mutations at live beta data. Keep generated Convex API types available to CI.
- [ ] Run `npx expo lint`, `npx tsc --noEmit`, `npm run test:backend`, `npm run test:ui`, `npx expo-doctor`. Record exit codes and unresolved warnings. If a check fails, fix the cause and rerun the affected check; do not mark beta complete with a known blocking failure.
- [ ] Execute the spec's beta acceptance on both devices with at least two independent accounts: all three login methods; onboarding; create/search/join/leave; camera/library/crop/rotate; post/retry/restart; edit/replace/delete; likes/comments; in-app notifications; profile/avatar; report/block/ban/admin removal; sign-out and account deletion. Record actual devices, OS/build versions and failures in `docs/beta-acceptance.md`. Include sparse-page feeds, 11th-post quota rejection and a ban during compose.
- [ ] Confirm the owner has supplied audience/content/retention decisions and a report handler before inviting real testers. Report remaining provider/signing/service limitations plainly. Commit only owned changes: `chore: prepare cross-platform development beta`.

## Execution record (2026-10-27)

- Local feature implementation is on `codex/beta`; automated rule/orchestration tests, lint/typecheck and native JavaScript exports have passed. Physical-device acceptance remains separate.
- The independent final review found and reproduced stale edit revisions, shared draft-slot overwrite, expired-upload retry failure, lost edit response failure and weak image validation. Regression tests now cover the fixes. OAuth cancellation with stale SDK resources was promoted to an important auth-flow issue and fixed in the same pass.
- Drafts are now keyed by account **and edit target**, retain their original revision, and reconcile committed writes before renewing stale assets. Edit request IDs are recorded transactionally in `postEdits`. JPEGs are decoded with explicit dimension/memory limits before storage.
- Clerk and Convex development resources were created/linked. The EAS project is `@gek007/codexgram`; native identifiers derive from that account (`dev.gek007.codexgram`). Public development settings are in the EAS profile; server credentials remain backend-only.
- Android cloud development build: `21120b9c-64ab-42e1-a3b4-bb9bc3a512a2` (check live status in `docs/beta-acceptance.md`). Initial iOS submission stopped at missing signing credentials; the owner is completing the interactive signing/device setup.
- Live OAuth provider round-trips, installed-device QR opening, camera/library editing on both OSes, admin account assignment, and external Clerk webhook registration are not yet accepted. See `docs/beta-testing.md` for exact steps.

## Completion and execution handoff

Execution order is Tasks 1–10. Provider setup and a first development build may be brought forward after Task 2 to validate OAuth early; final integrated acceptance still belongs to Task 10. Run tasks sequentially unless an approved execution approach explicitly delegates isolated work.

This plan is complete as a planning artifact when reviewed for spec coverage, matching endpoint/types, and concrete tests. The application is complete only with passing check output and actual device evidence. OAuth provider access, signing, developer membership or quota limitations can block delivery without blocking local implementation; report each precisely.

Ask the user to review the plan and choose one execution method: **Native** (same agent implements sequentially; recommended here because the domains share auth/access/media contracts) or **Subagent-driven** (fresh implementer and reviewer per task, greater context cost). Do not start product implementation until that choice/review is received. Keep the existing dirty workspace intact and stage only files owned by the execution task.
