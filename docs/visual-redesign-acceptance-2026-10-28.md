# Codexgram visual redesign acceptance

Date: 28 October 2026, Asia/Jerusalem. Selected direction: original boards 01–14, no coffee hero on sign-in. Implementation is committed on `codex/beta`; full physical-device acceptance is not complete.

## Implemented

- Shared design roles, native buttons, outlined provider buttons and marks, icon action rows, compact sheets, decorative brand illustrations and static feed skeletons.
- Original welcome collage from the supplied artwork; original sign-in/signup hierarchy; recovery illustrations and local password-confirmation validation; clearer username onboarding.
- Discovery search/grid/selected rows; community cover/identity; creation success uses the returned community ID. Incomplete onboarding resumes setup; completed accounts can share immediately.
- Explicit composer close, with close/gestures/navigation removal prevented during publishing. Completion disables that protection before opening the result. Existing draft/retry/media orchestration remains in use.
- Photo preview/caption hierarchy, contrasting crop guides, feed card framing and metadata, singular comment labels, inline comment composer, content actions and report confirmation.
- Activity rows can show the real post thumbnail, actor avatar and current comment text. The additive development query preserves post/actor visibility checks.
- Grouped settings and role actions, centered profile editing, read-only username and removal of repeated native/body titles.

No new native dependency, schema migration, seeded accounts/content, legal destination or privileged role grant was introduced. The existing Convex development deployment remains connected. Its additive notification query was deployed successfully.

## Verification evidence

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npm run typecheck` | Pass |
| `npm test` | 40 tests pass: 26 backend/pure-client tests and 14 UI tests in 7 UI suites |
| `npx expo-doctor` | 20/20 checks pass |
| iOS JavaScript export | Pass, including bundled welcome image and new navigation hook |
| Android JavaScript export | Pass, including bundled welcome image and new navigation hook |
| Server credential scan | Local Clerk server credential absent from exported iOS and Android bundles |
| Convex development functions | Prepared and deployed successfully; no schema migration |
| iOS installed development build | Existing iPhone 18 Pro / iOS 27 build loaded updated UI; redesigned populated Home visually inspected |
| Android installed development build | EAS build `21120b9c-64ab-42e1-a3b4-bb9bc3a512a2` FINISHED; APK installed successfully on Pixel 8 / API 35; Expo CLI opened project on Metro 8084 and loaded fresh Android JavaScript |
| Android application error logs | No ReactNativeJS/AndroidRuntime errors for the current Codexgram process. An unrelated Expo Go crash from an old emulator snapshot was excluded |
| Playwright supplementary web | Welcome, sign-in, signup, recovery and visibility toggle checked at 393×852 and 320×568. Light/dark rendered; no horizontal overflow; all seven sign-in buttons reachable by scrolling, with heights at least44px. No browser console errors |
| Design Report | Six pages cloned from retained reference, rendered and visually inspected; source reference unchanged; preserve-only package parts verified |

Playwright results are web layout checks, not native iOS or Android acceptance. Earlier native functional evidence is retained in `ios-simulator-audit-2026-10-28.md`; it does not establish that every redesigned screen has now been visually checked.

## Independent review and fixes

One fresh source/diff review found two important issues, both addressed:

1. New community success could navigate an onboarding user into guarded `/compose`. A regression failed before the fix. The success CTA now offers Continue setup until onboarding is complete. Tests cover both setup and completed-account Share paths using the mutation’s returned ID.
2. New composer close bypassed the publishing lock. A regression failed before the fix. The close control and native gestures now reflect `busy`; Expo Router `usePreventRemove` covers other removal attempts. A deferred-publish integration regression verifies attempted close cannot navigate and successful completion disables protection before replacing the route.

The final test suite passes after these fixes. No critical findings or deferred minor findings were reported.

## Remaining acceptance constraints

The Mac locked during native testing, and the UI automation tool could not unlock it. Native interaction stopped at that point; no lock or authentication bypass was attempted. Android Studio was opened for an embedded emulator view because the standalone QEMU window was not bindable by the native automation tool. The locked desktop prevented completion of that path.

Consequently, the redesigned native screens still require a complete visual/navigation pass in both runtimes, including short heights, keyboard, dark mode and larger Dynamic Type. Authenticated Android journeys have not been exercised through the UI in this pass. The original simulator text-size check also remains unverified.

Physical iOS signing/device registration, QR opening on physical devices, hardware camera, Facebook completion and full email verification/recovery need the corresponding credentials, devices or human authentication. Second-account interactions and privileged admin execution need real authorized accounts. The project has automated authorization/engagement coverage, but it has not received full two-account physical-device sign-off. Owner decisions on beta audience, content policy and retention, and external Clerk deletion webhook registration remain as recorded in the beta acceptance record.

## Running setup

Metro 8084 was started for Android; the user's Metro 8083 was preserved for iOS. No extra QA post or community was published during this redesign. The previously approved Photography QA content remains unchanged. Existing unrelated starter cleanup and original design references remain outside the implementation commits.
