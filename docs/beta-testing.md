# Codexgram development beta

Both iOS and Android use a development build. Google/Facebook OAuth needs this app's `codexgram://continue` callback; Expo Go is not the full-beta runtime. Push notifications are deferred.

## Local setup

Run `npm ci`. Copy `.env.example` to `.env.local` only if the local file does not exist. Set the three `EXPO_PUBLIC_*` values for the intended environment. Never copy `CLERK_SECRET_KEY` to a public variable. The key is backend-only; it may be in the ignored local file for server setup.

The dedicated Clerk development app is Codexgram; Google and Facebook are enabled, Native API is enabled, the Convex JWT audience is `convex`, and `codexgram://continue` is allowlisted. The linked Convex development project is Codexgram, deployment `dev/beta` in Europe. Production provider credentials and production rollout are outside this beta.

Run `npx convex dev` for backend changes and `npm run start:dev` for the mobile server. If port 8081 is in use, run `npm run start:dev -- --port 8082`.

## Install once, scan thereafter

1. Sign in to Expo with `npx eas-cli@latest login` and run `npx eas-cli@latest init` to link this project. Confirm the intended account/project. The EAS project is linked to the signed-in `gek007` account.
2. Confirm `ios.bundleIdentifier` and `android.package` in `app.json`. The `dev.gek007.codexgram` identifiers match the signed-in development account. Change them only if intentionally creating a new native identity.
3. The development profile in `eas.json` includes the three public app settings for this development deployment. Update that profile when switching environments. Server secrets remain in Convex and are not in the EAS profile.
4. Check current EAS build capacity and Apple developer signing access. iOS physical builds require a valid signing path and registered devices. Do not purchase membership or accept new charges without the owner's approval.
5. Run `npx eas-cli@latest build --profile development --platform android` and the corresponding command with `--platform ios`. Install each finished build using the EAS install page. Its QR/link installs the app; iOS installation is limited to the registered devices included in the provisioning profile.
6. Start `npm run start:dev`. Scan the terminal's project QR with the installed Codexgram development build. Keep the server running. The project QR opens JavaScript in the already installed build; it does not install a standalone app.
7. Use the same reachable network. For remote testing, `npm run start:dev -- --tunnel` needs Expo tunnel support and a running host. A development-server link is temporary.

A native dependency or native app-config change requires rebuilding/reinstalling. JavaScript changes can load from the running server without another native build. No app-store submission is part of this workflow.

## Backend-only settings

- `CLERK_JWT_ISSUER_DOMAIN`: Clerk issuer domain for this environment.
- `CLERK_SECRET_KEY`: the same instance's backend key, used only to finish account deletion.
- `APP_ADMIN_CLERK_IDS`: comma-separated verified Clerk user IDs for trusted app admins. Empty denies everyone access to the report inbox. Add the owner's account only after it exists; never infer admin from an email or client value.
- `CLERK_WEBHOOK_SECRET`: signing secret for a Clerk/Svix endpoint delivering `user.deleted` to `<EXPO_PUBLIC_CONVEX_SITE_URL>/clerk/webhook`. This endpoint is implemented but must be registered in the Clerk dashboard and its secret configured. Missing secret rejects deliveries. Webhook verification checks HMAC and timestamp.

Use `npx convex env set NAME` with a piped value or `--from-file` for secrets; do not paste secrets into committed commands. For a separate beta/production deployment, reconfigure the issuer, keys, callbacks and endpoint as a matching set.

## Checks and troubleshooting

Run `npm run lint`, `npm run typecheck`, `npm test`, `npx expo-doctor`. A native JS export verifies bundling, not installation or real-device behavior.

- OAuth finishes in a browser but not in the app: verify the exact callback URI and installed app scheme; test in a development build.
- Wrong/expired session: sign out and sign back in. New-device email verification is expected for password sign-in.
- No camera access: grant the permission in device settings or use the library. Picking a photo does not require microphone access.
- Upload failure: keep the draft and retry. Draft photos live in account-scoped document storage and are removed on sign-out/discard/success.
- Daily limit: 10 successful new posts per UTC day, including later-deleted posts. Replacing a photo is not a new post. Separate upload caps protect storage.
- No content: join a community; the home feed includes joined topics only. A filtered page may be empty with more pages available; use More photos.
- Reports unavailable: only a server-allowlisted admin can open the inbox. Community creators moderate content in their own communities.
- Account deletion remains pending: inspect the deletion job and backend key configuration; hourly retries finish Clerk deletion. Access is disabled immediately.

Before inviting real testers, the owner must establish audience eligibility, content rules, retention expectations and a person responsible for reports. Free tiers do not guarantee zero signing/build costs.
