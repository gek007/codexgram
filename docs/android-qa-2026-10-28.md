# Android emulator QA — 28 October 2026

Environment: Pixel 8 AVD, Android 15 / API 35, arm64, installed Codexgram
Expo development build, Expo SDK 58 / React Native 0.88. Native emulator UI was
controlled through computer use in Android Studio. Playwright is browser-only and
was not used to represent these as native Android tests.

## Scope and evidence

[Native screenshot gallery](../output/qa/android/index.html) contains 62 captured
views, including before/after regressions. Product components, Router native stacks
and tabs, forms, images, photo picker and crop manipulation were real. Clerk,
Convex, upload and draft persistence were replaced with opt-in local fixtures.
No live accounts, posts or database records were created by this walkthrough.

| Area | Android observations |
| --- | --- |
| Authentication | Welcome, sign-in, sign-up, email verification, reset request, reset code, new password, social continuation; numeric code entry and provider logos checked |
| Onboarding | Username and community selection rendered |
| Feeds | Home, Discover, community posts, public and own profile grids rendered with fake photos |
| Communities | Preview, join, joined, About, leave, creator tools and banned members; typed valid creation details and reached community-success screen |
| Posts | Photo detail, comments, like/count change, safety options, report reasons and report-success confirmation |
| Publishing | Source sheet, real Android library selection, crop, rotate, crop completion, composer, publishing progress, edit-post form, simulated upload failure with preserved draft |
| Account | Profile editor, Activity groups, grouped Settings, blocked accounts, report inbox and admin-denied state |
| Fallbacks | Empty feed/activity/profile/blocked/reports, unavailable community, loading community/feed, suspended-account screen after clean reload |

Screenshots verify rendering and the named interactions, not every possible action
on every screen. Live Google/Facebook OAuth, email delivery, real uploads, server
persistence, push delivery and physical-device behavior were not acceptance-tested
by this fake-data run. Native dark-mode/large-text settings were not changed during
this Android run.

## Fixes verified on Android

1. Google/Facebook logos used inline UTF-8 SVG data URLs that Android's image
   loader rejected. Bundled SVG assets now render in the real sign-in screen.
   Evidence: `03-sign-in.png` → `03-sign-in-fixed.png`.
2. Android composing text painted the entire six-digit code over the first visual
   cell despite transparent text paint. The underlying accessible input now also
   has near-zero opacity. Entry remains usable and the six cells render correctly.
   Evidence: `06-verification-keyboard.png` → `06-verification-fixed.png`.

## Harness observations and limits

Rapidly changing the fake session to suspended while simultaneously replacing the
route produced a navigation update-depth loop. The suspended-account screen itself
rendered after a clean reload (`59-account-reload.png`). The harness now delegates
that redirect to the real protected stack instead of issuing a competing replace.
A final transition recheck was interrupted by the computer-use host returning
`noWindowsAvailable`; that transition is not recorded as a pass. Other screens and
the native capture gallery were checked before this host-input failure.

The harness is local-only. Review identified that an inherited QA environment
variable could otherwise reach a production export; both the production environment
and production resolver now reject QA mode. Isolation checks pass. A normal
production export for Android, iOS and web succeeded and contains no QA menu or fake
upload error strings.

## Automated verification

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: 44 tests passed (26 backend, 18 UI).
- `node qa/native/check-isolation.cjs`: all 3 checks passed.
- `npx expo export --platform all --output-dir /tmp/codexgram-android-production-export`: passed.

These results do not establish full production readiness or substitute for the
live-service acceptance items above.
