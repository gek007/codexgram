# Codexgram

An iOS and Android photo-community app built with Expo SDK 58, Expo Router, Clerk and Convex. Users join public topic communities, publish photos, like/comment, and receive in-app activity notifications. Email/password, Google and Facebook sign-in are included. Remote push is deferred.

## Develop

```sh
npm ci
# Configure .env.local using .env.example; do not overwrite an existing local file.
npx convex dev
# In another terminal, after installing a development build:
npm run start:dev
```

The project QR opens Codexgram in the installed development build. This beta uses development builds rather than Expo Go for OAuth. See [the beta runbook](docs/beta-testing.md) for installation, signing, callbacks and backend settings.

## Verify

```sh
npm run lint
npm run typecheck
npm test
npx expo-doctor
```

Backend tests use Convex's local test runtime and do not mutate the cloud deployment. Native exports verify JavaScript bundling; physical device installation and OAuth testing are separate acceptance steps.

## Project

- `src/app/`: Expo Router routes and layouts.
- `src/features/`: auth, communities, feed, photos, profiles and moderation screens.
- `src/components/ui/`, `src/theme/`, `src/providers/`: shared mobile UI and providers.
- `convex/`: schema, backend rules, file ingestion, moderation, cleanup and tests.
- [Product specification](docs/superpowers/specs/2026-10-27-codexgram-beta-design.md)
- [Implementation plan](docs/superpowers/plans/2026-10-27-codexgram-beta.md)
- [Acceptance record](docs/beta-acceptance.md)

Application access is checked on the backend; client navigation guards are not a security boundary. Photos are stored in Convex; app blocking does not revoke a previously copied storage URL. Local drafts are cleared on sign-out, discard and successful publishing.
