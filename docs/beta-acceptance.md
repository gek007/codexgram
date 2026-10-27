# Codexgram beta acceptance record

Updated: 2026-10-28. This record distinguishes observed results from pending checks.

## Verified locally

- Automated backend and pure-client tests cover identity isolation, username/community uniqueness, membership/onboarding, media ownership/validation, daily quotas, safe publish/edit retries, source pagination, blocking, comments/likes/notifications, creator/admin authorization, account deletion and signed webhooks.
- Final automated result: **40 passing tests** (26 backend/pure-client, 14 UI). UI coverage includes disabled/loading controls, authenticated onboarding navigation, welcome/sign-in paths, report reason submission/confirmation, invalid community handle rejection before network submission, photo-source dismissal ordering/cancellation, reset password matching, community success/setup navigation, and publishing dismissal protection.
- Lint and TypeScript checks pass after excluding archived `example/` code.
- `expo-doctor`: 20/20 checks passed.
- iOS and Android JavaScript exports completed again after the design integration.
- EAS iOS simulator build `579a5d1b-e425-4e78-8100-fd3b9b46cb6b` finished, installed and launched on iPhone 18 Pro / iOS 27. Native authenticated community onboarding and the community creation form were visually checked. Physical-device acceptance remains pending.
- The local web diagnostic preview rendered the real Clerk authentication screen, including Google/Facebook controls and dark appearance. A real invalid-account attempt returned a recoverable Clerk error and reenabled controls. This is not the delivery target or a substitute for device QA.
- Exported native bundles were checked for the local Clerk server secret; no match was found.
- Independent review completed. Important findings received regression tests and fixes: original edit revision, separate draft slots, stale asset renewal, idempotent edits, complete JPEG decoding, and realistic OAuth cancellation.

## Configured services

- Clerk: dedicated Codexgram development application; Native API enabled; email/password and Google/Facebook configured; Convex JWT template and `codexgram://continue` callback registered.
- Convex: `kostya-shilkrot/codexgram`, Europe development deployment `dev/beta`; functions deployed; issuer and backend deletion credential configured.
- EAS: [@gek007/codexgram](https://expo.dev/accounts/gek007/projects/codexgram), app identity `dev.gek007.codexgram` on both platforms. Android keystore generated on EAS; no signing secrets committed.
- Android build [21120b9c-64ab-42e1-a3b4-bb9bc3a512a2](https://expo.dev/accounts/gek007/projects/codexgram/builds/21120b9c-64ab-42e1-a3b4-bb9bc3a512a2) finished successfully; its APK was installed on the Pixel 8 emulator and loaded updated development JavaScript. Authenticated Android UI acceptance is pending.
- Initial iOS submission stopped before build creation because internal-distribution signing credentials were absent. Owner has been given the complete interactive command.

## Not yet accepted

| Check | State |
| --- | --- |
| Android native build/install | Build FINISHED; emulator install and fresh JS load observed. Full UI and physical-device acceptance pending |
| iOS physical build/install | Apple credentials and registered devices pending |
| Development-client QR opening | Requires installed builds and reachable running server |
| Google and Facebook round-trips | Google completed native simulator sign-out/sign-in and returned to the same account Home; Facebook native prompt cancellation recovered. Facebook completion and both providers on physical platforms remain pending |
| Email signup/verification/recovery and restart | SDK integration and orchestration checked; real-device session evidence pending |
| Camera/library/crop/rotate on both OSes | iOS simulator library, crop/rotate completion and publish observed; detailed image framing, physical camera and Android remain pending |
| Two real accounts across iOS/Android | Pending installed builds |
| Owner/admin report handler | `APP_ADMIN_CLERK_IDS` must be set to the owner's verified Clerk ID after signup |
| Externally deleted Clerk accounts | Verified webhook receiver implemented/tested; dashboard endpoint and signing secret still need registration |
| Audience, content rules and retention | Owner decisions required before inviting real testers |

Remote push, store submission, Expo Go delivery and paid features remain outside the agreed beta scope. See [the runbook](beta-testing.md) for setup and recovery instructions.

## Supplied design integration

Source: `output/design/codexgram-beta/01–14` and `design-notes.txt`, supplied by the owner. These references replace the earlier provisional styling.

- Shared ivory/violet and dark tokens, pill buttons, 12-point fields, four-corner aperture wordmark, and native header/tab safe-area spacing.
- Welcome, sign-in, signup, verification/recovery typography and provider controls; password visibility controls.
- Discover two-column covers, search/onboarding rows, selected membership controls and community cover previews.
- Home brand toolbar with separate New post action; photo-led feed cards; three-column profile grids and separate profile editing.
- Community → photo source sheet → crop/rotate with thirds guides → caption/publish. Existing publish reconciliation and durable draft behavior retained.
- Post/comment options and report reasons in native bottom sheets; report confirmation; settings and destructive action styling.
- Brand covers are local vector adaptations of the supplied illustrations. Welcome uses these covers rather than copied sample photographs. Sample users, photos and communities were not seeded into the live backend.
- Mockup assumptions such as a custom legal document, an appearance override, resolved-report browsing and a separate creator member directory were not added as new requirements. Device appearance and the approved creator controls remain authoritative. The installed development client's launcher icon remains the earlier camera icon until a later native branding rebuild.
- Native simulator audit now covers populated Home, Discover/search, community/creator tools, composer/library/crop/draft/publish, post/comment editing, profile grid/edit, settings, empty Activity/Blocked accounts, deletion cancellation, auth entry forms and dark appearance. See [the detailed audit](ios-simulator-audit-2026-10-28.md) for exact coverage, the fixed photo-picker blocker and remaining findings. Two-account and physical-device acceptance remains pending. No claim of pixel-perfect coverage of every raster mockup is made.

## Original board redesign

Owner approved original boards01–14 with no coffee hero. The visual implementation, independent review fixes and final40-test verification are recorded in [the redesign acceptance report](visual-redesign-acceptance-2026-10-28.md). Complete native verification was interrupted when the Mac locked; no claim of full two-platform physical acceptance is made.
