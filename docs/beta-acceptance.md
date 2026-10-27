# Codexgram beta acceptance record

Date: 2026-10-27. This record distinguishes observed results from pending checks.

## Verified locally

- Automated backend and pure-client tests cover identity isolation, username/community uniqueness, membership/onboarding, media ownership/validation, daily quotas, safe publish/edit retries, source pagination, blocking, comments/likes/notifications, creator/admin authorization, account deletion and signed webhooks.
- Final automated result: **27 passing tests** (26 backend/pure-client, 1 UI). The UI button test verifies disabled/loading controls cannot submit.
- Lint and TypeScript checks pass after excluding archived `example/` code.
- `expo-doctor`: 20/20 checks passed.
- iOS and Android JavaScript exports completed. This is bundling evidence, not proof of native installation.
- The local web diagnostic preview rendered the real Clerk authentication screen, including Google/Facebook controls and dark appearance. A real invalid-account attempt returned a recoverable Clerk error and reenabled controls. This is not the delivery target or a substitute for device QA.
- Exported native bundles were checked for the local Clerk server secret; no match was found.
- Independent review completed. Important findings received regression tests and fixes: original edit revision, separate draft slots, stale asset renewal, idempotent edits, complete JPEG decoding, and realistic OAuth cancellation.

## Configured services

- Clerk: dedicated Codexgram development application; Native API enabled; email/password and Google/Facebook configured; Convex JWT template and `codexgram://continue` callback registered.
- Convex: `kostya-shilkrot/codexgram`, Europe development deployment `dev/beta`; functions deployed; issuer and backend deletion credential configured.
- EAS: [@gek007/codexgram](https://expo.dev/accounts/gek007/projects/codexgram), app identity `dev.gek007.codexgram` on both platforms. Android keystore generated on EAS; no signing secrets committed.
- Android build [21120b9c-64ab-42e1-a3b4-bb9bc3a512a2](https://expo.dev/accounts/gek007/projects/codexgram/builds/21120b9c-64ab-42e1-a3b4-bb9bc3a512a2) was submitted; build result is pending at this record's creation.
- Initial iOS submission stopped before build creation because internal-distribution signing credentials were absent. Owner has been given the complete interactive command.

## Not yet accepted

| Check | State |
| --- | --- |
| Android native build/install | Cloud build pending; installation not observed |
| iOS physical build/install | Apple credentials and registered devices pending |
| Development-client QR opening | Requires installed builds and reachable running server |
| Google and Facebook round-trips | Configured, not exercised on physical devices |
| Email signup/verification/recovery and restart | SDK integration and orchestration checked; real-device session evidence pending |
| Camera/library/crop/rotate on both OSes | Implementation and native bundling verified; device behavior pending |
| Two real accounts across iOS/Android | Pending installed builds |
| Owner/admin report handler | `APP_ADMIN_CLERK_IDS` must be set to the owner's verified Clerk ID after signup |
| Externally deleted Clerk accounts | Verified webhook receiver implemented/tested; dashboard endpoint and signing secret still need registration |
| Audience, content rules and retention | Owner decisions required before inviting real testers |

Remote push, store submission, Expo Go delivery and paid features remain outside the agreed beta scope. See [the runbook](beta-testing.md) for setup and recovery instructions.
