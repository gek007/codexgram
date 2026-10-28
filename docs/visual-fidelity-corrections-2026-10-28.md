# Visual fidelity corrections — 2026-10-28

The previous implementation applied shared colors and basic patterns but did not
faithfully carry through several board compositions. This pass corrects those
visible gaps using the original `output/design/codexgram-beta/` boards (option B,
without the later coffee sign-in hero).

## Changes

- Reused the supplied decorative illustrations and four community artworks,
  including a clean cover crop with no baked-in status bar or buttons. White
  mattes are removed for dark appearance. Original design boards are unchanged.
- Made community covers full width with an overlapping rounded information
  surface, custom Back action, joined Posts/About controls, and creator controls.
- Replaced generic recovery icons with the envelope/lock/key/provider artwork,
  centered recovery headings, and six verification cells backed by one native
  input for accessible editing, paste, and autofill.
- Corrected outlined profile editing controls, filled selected tabs and liked
  hearts, profile header Save, grouped settings/source rows, reporting layouts,
  report review, compact blocked-account rows, Activity grouping and crop stage.
- Reduced post-detail insets. Reset scrolling when switching auth screens and
  when community creation enters its success screen. Creation success hides
  the form's native navigation header, matching its distinct composition.
- Kept the existing Clerk/Convex integration and permissions. No reference
  photographs, fake members, avatars, or communities were seeded into live data.

## Evidence and reproduction

`output/qa/fidelity/comparison.html` places each screen board beside corresponding
actual-component fixture screenshots. `contact-sheet.png` is a compact overview.
There are 46 fixture captures covering auth/recovery, onboarding, discovery,
community states, creation/success, composer/crop/publishing/retry/edit, feed/post,
profiles, Activity, reporting, creator/admin tools, Settings, dark and empty states.
Boards 01/02 are the system and journey rather than additional app screens.

The separate `qa/visual/` Vite harness renders real app feature components with
local fixture data. It replaces service hooks, navigation, native images/icons,
media and drafts. It cannot contact Clerk/Convex or upload/publish content.
Its navigation frame is illustrative. These captures verify component layout;
they are **not native end-to-end acceptance tests**. See its README to reproduce.
The harness and its photographs are excluded from EAS build archives.

Native iOS screenshots in `output/qa/fidelity/native-ios/` show the real account,
profile, settings, source sheet, Discover, full-cover community and creator tools.
The current account's initial avatar and white QA photo are actual data; the
reference's portraits and photographs remain local visual test fixtures.

## Verification

- `npm run lint`: passed with no errors or warnings.
- `npm run typecheck`: passed.
- `npm test`: 44 passed (26 backend/pure-client, 18 UI; 25 suites total).
- `npx expo export --platform ios --platform android`: both bundles exported.
- `git diff --check`: passed.
- Independent review found and verified fixes for all three reported issues:
  restored posts after leaving from About, visible Back in unavailable/loading
  states, and visible failure feedback inside the moderation review sheet.
- Added behavioral coverage for code paste, community tab/membership transitions,
  and moderation failure feedback. Existing upload/navigation safety tests pass.

## Acceptance limits

This is a visual correction and evidence pass, not a declaration of production
readiness. Native iOS verification used the signed-in account and simulator.
Authenticated Android visual acceptance, full native OAuth, physical iOS signing,
and destructive moderation/account actions were not completed in this pass.
Android Studio's device selector did not expose an emulator, and the subsequent
computer-control attempt returned `noWindowsAvailable`; no Android visual result
is inferred from the successful bundle export.

Layouts adapt to device dimensions, native OS controls, dark mode and large text.
The supplied artwork is cropped from raster boards and retains their resolution.
Approved beta scope still governs functionality: reference-only member-directory,
resolved-report browsing, and unconfigured legal destinations are not invented.
