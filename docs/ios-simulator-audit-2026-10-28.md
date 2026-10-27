# iOS simulator audit — 2026-10-28

Target: installed Codexgram development build, iPhone 18 Pro / iOS 27. Backend: existing Convex development deployment. Account: community owner `@kostya`.

Method: native Device Hub UI automation through CUA accessibility controls and screenshots. Playwright does not control native iOS screens; this record is native simulator testing, not Playwright coverage. Pass below means the named interaction was observed; it does not imply exhaustive state, accessibility, or physical-device acceptance.

## Observed coverage

| Screen / flow | Result and scope |
| --- | --- |
| Welcome, signup, sign-in | Opened all three; signup password visibility toggled; sign-out returned to welcome. No new account created. |
| Password recovery | Form opened and returned to sign-in; no email sent or password changed. Verification/code entry remains untested. |
| Facebook OAuth | Native Facebook sign-in permission prompt opened; cancellation returned to enabled sign-in controls. Provider round-trip not completed. |
| Google OAuth | Native Google sign-in prompt opened; Continue completed existing Google authentication and returned to the signed-in Home feed with the same account/post. No credential entry was needed. |
| Username/community onboarding | Earlier authenticated onboarding observed; this audit checked existing membership and community creation form, not a new-account replay. |
| Home | Empty and populated feeds, author/community navigation, own-post options, like state and comment count observed. |
| Discover | Two-column directory, matching search, no-results state, clearing search, community navigation. |
| Community detail | Photography membership/feed, creator tools expand/collapse and empty banned-members section. |
| Create community | Handle guidance; blank handle rejected inline without mutation/server error; accent selection changed. No extra community saved. |
| Composer | Community selection, disabled Add photo before selection, source sheet, native library, crop/rotate completion, caption/count and publish loading state. |
| Draft | Keep draft then reopen restored photo, community and caption. |
| Publish | Approved repository JPEG uploaded and post created in Photography. Post detail opened successfully. |
| Post detail / edit | Like toggled to count 1; caption saved as `QA simulator test - edited`; Edited label shown; like retained. Replacement photo not exercised. |
| Comments / edit | Created `QA comment`, edited to `QA comment - edited`; count 1 and Edited label observed. |
| Delete post | Confirmation inspected and canceled. Actual deletion not exercised. |
| Profile / You | Own profile navigation, initials, edit action and published thumbnail grid observed. Other-user profile actions need a second account. |
| Edit profile | Fields opened; unchanged profile saved successfully. Avatar library and crop opened, then canceled; original avatar retained. |
| Settings | Account links, device appearance explanation, Activity navigation and sign-out observed. |
| Blocked accounts | Empty state observed. Block/unblock needs another account. |
| Delete account | Destructive confirmation inspected and canceled with Keep account. No deletion submitted. |
| Activity | Empty state and Settings shortcut observed. Own actions correctly produced no self-notification; populated activity needs another account. |
| Dark appearance | System Dark mode applied; Discover, populated Home and post action sheet visually checked. Restored Light with Automatic off. |
| Larger text | Not verified: simulator Text Size interactions did not change the slider from its original 50%. Original 50%, Bold off and default zoom retained. |
| Admin reports | Not exercised: current account has no configured admin role. |

## Blocking defect found and fixed

Choosing a photo from the source sheet could immediately dismiss the native iOS library picker. The source sheet's React Native Modal was still dismissing when UIKit presented the picker. Simulator logs showed the picker scene being created and invalidated during the same transition.

A shared PhotoSourceSheet now waits for iOS Modal.onDismiss before presenting the selected source. Android/web launch immediately because the callback is iOS-specific. Cancel never selects a source, and duplicate completion callbacks cannot launch twice. Both composer and avatar selection use it.

Regression tests cover delayed iOS selection, cancel and Android behavior. Native retest opened the actual library and crop screen; the composer then uploaded/published successfully, and avatar selection also opened correctly. No native dependency or rebuild was required.

## Remaining findings and limits

- Composer lacks an explicit close/back control; iOS modal dismissal and Keep draft work, but an obvious close action would improve discovery.
- Edit post, Edit profile, Settings and Blocked accounts repeat native header titles in the body.
- White crop guides disappear against a white photo; add contrast/shadow in a future polish pass.
- Accessible comment count says `1 comments`.
- Development-client gear overlay can cover top-right app actions; treat this separately from production layout.
- The approved test JPEG is a white 100×100 square. Crop/rotate completed, but framing/rotation correctness on a detailed non-square photo is not established by this fixture.
- Camera hardware, Android native behavior, physical-device distribution/QR, full email verification/recovery, Facebook round-trip, second-user report/block/ban/notifications, admin moderation, offline/upload-failure states, VoiceOver and larger Dynamic Type still require acceptance testing. No roles or users were fabricated to simulate coverage.
- Delete confirmations were canceled; no account or content was deleted.

## QA content and verification

User approved the repository fixture upload and labeled development content. Photography retains the post `QA simulator test - edited`, one own like, and comment `QA comment - edited`. Profile bio/avatar were preserved.

Verification after the picker fix: lint and TypeScript checks passed; **34 tests passed** (26 backend/pure-client + 8 UI across 6 UI suites). This does not turn untested native flows above into accepted flows.

Final simulator state: signed in as `@kostya` on Home after the Google round-trip; system Light restored.
