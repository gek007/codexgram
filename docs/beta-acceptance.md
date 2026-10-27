# Codexgram beta acceptance record

Date: 2026-10-27. This record distinguishes observed results from pending checks.

## Verified locally

- Automated backend and pure-client tests cover identity isolation, username/community uniqueness, membership/onboarding, media ownership/validation, daily quotas, safe publish/edit retries, source pagination, blocking, comments/likes/notifications, creator/admin authorization, account deletion and signed webhooks.
- Final automated result: **30 passing tests** (26 backend/pure-client, 4 UI). UI coverage includes disabled/loading controls, authenticated onboarding navigation, welcome/sign-in paths, and report reason submission/confirmation.
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
- Android build [21120b9c-64ab-42e1-a3b4-bb9bc3a512a2](https://expo.dev/accounts/gek007/projects/codexgram/builds/21120b9c-64ab-42e1-a3b4-bb9bc3a512a2) was submitted; it is IN_PROGRESS at the latest check.
- Initial iOS submission stopped before build creation because internal-distribution signing credentials were absent. Owner has been given the complete interactive command.

## Not yet accepted

| Check | State |
| --- | --- |
| Android native build/install | Cloud build pending; installation not observed |
| iOS physical build/install | Apple credentials and registered devices pending |
| Development-client QR opening | Requires installed builds and reachable running server |
| Google and Facebook round-trips | Google reached username onboarding in a real web session; authenticated onboarding also observed natively. Full provider checks on both physical platforms remain pending |
| Email signup/verification/recovery and restart | SDK integration and orchestration checked; real-device session evidence pending |
| Camera/library/crop/rotate on both OSes | Implementation and native bundling verified; device behavior pending |
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
- Observed visual checks: clean dark web welcome/sign-in, native light onboarding empty state and creation form. Populated feeds, profile grids, action sheets and media states still require the two-account physical-device acceptance run. No claim of pixel-perfect coverage of every raster mockup is made.
