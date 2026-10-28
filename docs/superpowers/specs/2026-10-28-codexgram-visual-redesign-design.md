# Codexgram visual redesign

## Intent and selected approach

Match the original 14 supplied boards in `output/design/codexgram-beta/` across the existing iOS and Android app. The owner selected B: original boards, with no coffee hero on sign-in. The coffee image variants are excluded. The purpose is closer visual fidelity and clearer controls while keeping the tested beta functional.

Approaches considered: A used the original boards with the newer coffee sign-in; B uses only the original boards; C changes authentication only. The owner chose B. This is a visual pass across existing routes, not a change to product scope or backend access.

## Visual contract

- Board 01 governs color, type hierarchy, spacing and reusable components. Light background #FAF9F6, surface #FFFFFF, ink #202024, muted #686670, line #E3E1E8, violet #5B36E8; dark background #151419, surface #232128, text #F6F4FA, muted #B9B5C4, lavender #B5A0FF.
- Native platform sans-serif, bold display 32/38, title 28/34, section 20/26, body 16/24, label 14/20, metadata 12/16. Use 8-point spacing rhythm with 24-point primary horizontal margins where the boards show forms, and smaller feed/grid insets where shown.
- Inputs have 12-point corners. Cards and sheets have approximately 20-point corners. Primary buttons are violet pills; outlined secondary, plain text tertiary and clear red destructive actions are distinct. Touch areas remain at least 44 points and text can scale.
- Four tabs remain Home, Discover, Activity, You. Native status bars, keyboards, picker and back navigation retain their platform behavior. Do not render screenshot chrome or phone frames inside the app.
- The supplied raster screens are references, not replacement interactive screens. Recreate text, fields and controls as native components. Reuse isolated supplied decorative art where clean extraction is practical; retain scalable local community artwork otherwise. Do not fabricate user posts or identities to fill grids.
- Light/dark follows device settings, as already agreed. Match dark board 13 without adding a new appearance selector.

## Screen mapping

| Board | Existing area | Proposed changes |
| --- | --- | --- |
| 01 Design system | Theme, Brand, Button, Field, Screen, Sheet, StateView | Centralize type and spacing; add secondary/tertiary/destructive distinctions, provider icons, consistent focus/error states and sheet rows. |
| 02 Journey map | Existing Router routes | Use as coverage inventory; keep route guards and activation sequence. |
| 03 Welcome and auth | AuthScreen | Match original welcome collage and hierarchy. Sign-in has back action, heading, fields, forgot-password link, primary submit, provider icon buttons and inline account switch. No coffee hero. Signup mirrors this hierarchy. |
| 04 Verify and recover | AuthScreen modes | Add compact envelope/lock/key illustrations and centered recovery hierarchy; maintain accessible code entry and SDK-supported sequential reset steps. Add local confirm-password matching if needed for the pictured reset confirmation. |
| 05 Onboarding and discovery | Username route and DirectoryScreen | Step indicators, initials treatment, selected community rows, two-column directory, search icon/clear control and pinned continuation where practical with keyboard/text scaling. |
| 06 Communities | CommunityScreen and CreateCommunityScreen | Cover and overlapping identity treatment, clearer Joined/New post hierarchy, creator attribution and compact create form/preview. Add an in-screen success state after a confirmed create, with Share a photo and Go to community. |
| 07 Compose | ComposerScreen and PhotoEditor | Clear close/back control; joined-community rows; icon source sheet; photo preview/caption hierarchy. Preserve native camera/library and the tested iOS dismissal ordering. Improve crop-guide contrast. |
| 08 Publish and edit | ComposerScreen and post detail | Clear publishing state using real upload state; preview, edited metadata and replacement affordance. Keep draft reconciliation, engagement retention and retry semantics. Do not display invented progress percentages. |
| 09 Feed and interaction | FeedScreen, PostCard, CommentList, NotificationsScreen | Rounded photo cards with compact author/community metadata, icon/count engagement row, comment composer and grouped activity rows using actual data. Fix singular comment count. |
| 10 Profiles | ProfileScreen and AccountSettingsScreen | Avatar beside identity/bio, concise Edit profile action and tight three-column photo grid. Center edit avatar/source affordance; remove repeated native/body titles. |
| 11 Report and block | ContentMenu | Icon action rows, reason radio choices, confirmation hierarchy and destructive block styling. Keep current reasons and mutual-block rules. |
| 12 Moderation | Creator tools and admin reports route | Style existing role-gated controls and report review with compact rows and clear confirmations. Do not add a new member directory, role grants or resolved-report browser. |
| 13 Account and dark | Settings and blocked routes | Grouped settings rows with icons, subtle section labels, distinct destructive actions and clean dark surfaces. Keep device appearance explanation; do not invent legal URLs or identity fields. |
| 14 Important states | StateView and existing screen errors | Illustrative empty states, skeletons where applicable, error/warning/success cards, retained-draft retry, permission alternatives and unavailable/suspended states. Display actual quotas and UTC reset copy. |

## Boundaries and implementation decisions

Clerk and Convex stay connected. Keep Google/Facebook, existing validation, quotas, permission checks, moderation authorization, account deletion and safe retry behavior. No migrations, seeded sample accounts/posts, new legal terms, paid features or store release are part of this pass. Existing sample names and photographs are decorative reference content, not production data.

Builder decisions: use existing Expo/RN components and icons; avoid a new UI framework or font dependency. Keep accessible native text fields for verification rather than six independent inaccessible inputs. Preserve sequential SDK reset verification even when board 04 compresses the steps. The community-created success panel is local UI after a successful existing mutation. Use a responsive scroll fallback for short screens and large text; primary actions must remain reachable.

The current iOS simulator audit found repeated body/native titles, an unclear composer exit and low-contrast crop guides. This pass includes those visual issues. The fixed native source-sheet dismissal behavior must remain intact.

## Acceptance

Compare implemented screens against boards 01–14 at comparable viewport sizes; record intentional platform/product deviations. Inspect welcome/auth, onboarding, Discover/search, community/create/success, Home, post/comment edit, composer/crop/upload states, profile/edit, settings/blocked, report and available role controls. Run lint, typecheck and current regression tests. Add focused behavioral tests for any new confirmation or navigation behavior rather than tests of static style values.

Verify reachable iOS screens natively and Android where a runtime is available; use web only as a supplementary layout check. Check light/dark, smaller height, keyboard and larger text. Report states requiring another real account, admin access, hardware or credentials as unverified instead of fabricating coverage. Do not publish extra content or perform destructive actions without appropriate authorization.

## Delivery

Create the retained-template Design Report and use this design as the implementation contract. After owner approval, write the implementation plan, then apply and verify the visual changes. Preserve unrelated starter cleanup and source images.
