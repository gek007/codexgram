# Codexgram beta specification

Date: 2026-10-27. Source: the product interview in this chat. The user approved moving to implementation planning, then added Google/Facebook OAuth and chose development builds for the full beta. Implementation has not started.

## Product and success

Codexgram connects people through public topic communities centered on photos. Deliver the smallest complete private beta on **both iOS and Android**. A tester can create an account, join a community, publish a photo, and interact with another real tester. The product is English-only, free, and has no ads. Prefer service free tiers; no fixed deadline was supplied.

## Confirmed requirements

- Anyone can create a public community. Joining is required to publish there. Users search by community name and browse a directory.
- Home shows recent posts from joined communities; there is no people-following system.
- One photo and an optional caption per post. Capture with the camera or choose from the photo library; provide crop and rotate controls.
- Authors can edit captions, replace photos, and delete posts. Replacement retains likes/comments and displays an edited label.
- Likes and flat comments; authors can edit and delete their own comments.
- Profiles contain a username, avatar, bio, and the user's photo posts.
- New users choose a username and join communities before reaching home.
- Community creators remove posts/comments and ban members. Users report posts, comments, and accounts to app admins.
- Blocking mutually hides content and prevents interaction across communities.
- In-app notifications for likes and comments. **Remote push remains deferred**, even though development builds now permit it.
- Compress photos; enforce **10 posts per user per day**. Preserve failed-upload drafts and offer explicit retry. No full offline feed or automatic offline posting queue.
- Bold, playful visual direction, expressive community identities, light and dark modes.
- **Clerk** authentication with email/password, **Google**, and **Facebook**. **Convex** backend and photo storage. Retain Expo, React Native, and Expo Router.
- Full beta uses installed **development builds**, then QR codes open the running project. This supersedes the earlier Expo Go-only and TestFlight-only decisions.

## Core flows and screens

1. Welcome → sign in/sign up with any supported method → finish verification/missing auth requirements → choose username → browse/join at least one community → home.
2. Returning authenticated user → restore session → home; incomplete onboarding resumes at its unfinished step.
3. Discover → search/browse communities → community detail → join → community posts → composer.
4. Composer → camera/library → crop/rotate → caption/preview → upload/publish → post detail. Failure retains the draft; retry cannot duplicate a post.
5. Home/community/profile → post detail → like/comment → notifications for the post author → notification opens its post.
6. Own profile → edit avatar/bio; own post → edit caption/replace photo/delete; own comment → edit/delete.
7. Content/user menu → report or block; creator tools → remove content/ban; admin report inbox → resolve/remove/suspend.
8. Settings → blocked accounts/unblock, sign out, account deletion.

## Architecture and selected approach

Use custom React Native authentication screens backed by Clerk, with its browser OAuth flow for Google/Facebook. Convex validates Clerk identity and owns all application authorization, records, reactive feeds, media ownership, and in-app notifications. The client owns transient editing state and a durable local retry draft. Never store passwords or provider secrets in Convex or the app bundle.

The alternatives considered during the interview were Expo Go QR previews versus installed development builds. The user chose development builds after OAuth was added. Preserve QR-based opening of the development server. Native provider-specific sign-in SDKs and a separate custom backend are unnecessary for this beta.

Use EAS cloud development builds and generated native projects. Do not hand-edit/create `ios/` or `android/`. A QR code is not an access control: app authentication and server permissions remain required.

## Data model

| Record | Main fields and relationships |
| --- | --- |
| users | Clerk subject/issuer identity, normalized username, bio, optional owned avatar asset, onboarding state, active/deleting/suspended/deleted status |
| communities | unique normalized handle, name, description, creator user, accent color, active/archived status |
| memberships | community and user; one row per pair |
| posts | community, author, owned photo asset, optional caption, created/edited times, active/removed/deleted status, retry request ID, aggregate counts |
| comments | post, author, text, created/edited times, active/removed/deleted status; no parent comment |
| likes | post and user; one row per pair |
| notifications | recipient, actor, post, optional comment, like/comment kind, event key, read time |
| reports | reporter, typed target, reason, open/resolved status, reviewer and disposition |
| blocks / bans | directed user pair / community-user pair; authorization treats a block in either direction symmetrically |
| mediaAssets | owner, storage ID, upload request ID, purpose, pending/attached/deleting status, byte count, created time |
| dailyUsage | user, UTC date, successful publish count, photo-upload count |
| deletionJobs | user, phase and cursor for resumable cleanup |

Clerk owns authentication and account linking. Convex user records use Clerk identity, never a submitted email, to establish ownership. All public backend functions validate identity and arguments; privileged roles come only from server configuration.

## Proposed implementation defaults (ASSUMPTIONS)

These are defaults made by the planner, not additional interview answers:

- Public means visible to signed-in beta users. No unauthenticated browsing in this beta.
- Feeds are newest-first; comments oldest-first. Unique usernames/handles ignore case, contain 3–24 lowercase letters/digits/underscores. Names allow spaces, up to 60 characters. Bios ≤160, descriptions ≤500, captions ≤2,000, comments ≤1,000 characters.
- Require at least one community join for first onboarding. Later leaving all communities shows a discovery empty state. Creating a community joins its creator automatically.
- Community creators are the only community moderators. App admins can override moderation and suspend abusive accounts. Keep an admin allowlist in backend configuration; never accept a role from the client.
- A community ban prevents joining, posting, liking, and commenting there; public community reading remains available. A creator cannot ban themselves or leave their community; ownership transfer is deferred.
- Blocking hides posts, comments, profiles, notifications, and direct fetches in both directions. Community metadata remains discoverable even if its creator is blocked. Authorized moderation retains access to reported content.
- Daily post limits reset at 00:00 UTC and apply to successful new posts, including posts later deleted. Photo replacements do not count as new posts. Separately limit accepted post/replacement uploads to 20 per day and avatar uploads to 5 per day to bound storage abuse.
- JPEG output, longest edge ≤1,600 px, target quality 0.8, upload limit 5 MiB. A simple square crop with adjustable position and 90° rotation is sufficient. Drafts are per account and survive app restarts; sign-out clears that account's local draft.
- One like notification per actor/post for its lifetime; one per created comment; no self-notifications. Editing content creates no notification. Removed/blocked targets show an unavailable state.
- Include email verification, password reset, session restoration, sign-out, and account deletion. OAuth users with missing/unsafe identity data finish Clerk's requirements before app onboarding. Rely on Clerk's verified account-linking rules; do not merge users by client-submitted email.
- Account deletion immediately disables application access and queues bounded Convex cleanup. Preserve communities by archiving them when their creator deletes their account. Remove authored content and media, then delete the Clerk identity through a resumable server-side step; retain a minimal job tombstone until completion.
- Start with separate developer and beta deployments/keys, no seeded fake content in live beta data. A development-instance limitation is a blocker to resolve, not permission to use an unsafe auth bypass.
- Basic structured backend errors and service dashboards are sufficient; no paid analytics/monitoring SDK in v1. Accessibility includes semantic labels, scalable text, contrast, and 44-point touch targets.

## Out of scope

Videos, albums, filters, direct messages, people-following, threaded replies, private communities, ownership transfer, Android/iOS store release, TestFlight-only distribution, production OAuth provider review, paid features, ads, remote push, full offline synchronization, and a web product.

## Open risks and required evidence

- Clerk, Convex, Expo/EAS accounts, backend deployment access, OAuth configuration, and signing credentials have not been inspected or provisioned.
- Physical iOS development distribution needs a valid signing path and registered test devices. Free service tiers do not guarantee free Apple membership or EAS build capacity. Surface actual costs before any paid action.
- Clerk development social credentials may suit an initial test, but beta provider availability, account linking, missing Facebook email, callback allowlisting, and revoked sessions require real-device verification. Provider secrets stay in Clerk's configuration.
- The sparse home feed strategy in the plan prioritizes bounded reads for the small beta. Many unrelated public posts can yield short pages; measure actual read usage before expanding the audience.
- Blocking provides application-level hiding, not prevention of screenshots or revocation of previously copied public storage URLs. Decide whether protected media serving is required before broader launch.
- Audience age, content policy, retention details, and the person who will handle reports need owner decisions before real-user beta invitation.
- Installed versions are recorded in the plan; documentation confirms intended APIs, not a proven complete integration. No app feature or device test has passed yet.

## Beta acceptance

Two independent accounts on physical iOS and Android can complete all three auth methods, onboarding, joining/creating communities, capture/library crop/rotate, posting/editing/replacement, likes/comments, notifications, reports, blocking and moderation. Restart/retry produces no lost draft or duplicate post. Server tests enforce ownership, moderation, block/ban rules, and quotas. Lint/typecheck and targeted automated tests pass. Native build install and QR open work on both devices. A signing/provider blocker is explicitly reported rather than claimed complete.
