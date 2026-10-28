# Native fake-data QA

Run the actual app screens with local in-memory authentication, query, mutation,
draft and upload substitutes. The normal Metro configuration uses real services.
The harness is available only with `CODEXGRAM_NATIVE_QA=1`; production mode rejects
it. `qa/` is excluded from EAS uploads. No real database or OAuth requests are made.

Install the project's development build and start a separate Metro instance:

```sh
EXPO_NO_DOTENV=1 CODEXGRAM_NATIVE_QA=1 \
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bG9jYWxob3N0JA \
EXPO_PUBLIC_CONVEX_URL=http://127.0.0.1:1 \
EXPO_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:1 \
npx expo start --dev-client --port 8086 --android
```

Use the floating **QA** menu to select any of 31 scenarios. **NEXT QA** advances.
Navigation, native controls, image picker, image manipulation, rendering, forms,
validation and app error handling remain real. Service responses are simulated.
Scenario changes preserve in-memory mutations until Metro reloads. The native
photo picker uses actual emulator media; select a non-sensitive test image.
Stop this server and reopen the regular development server to use live services.

```sh
node qa/native/check-isolation.cjs
```

This check verifies default resolution and both production rejection paths.
`crop.py`/`contact.py` process screenshots already captured through computer use;
they do not capture or control the emulator. Update crop bounds after resizing
Android Studio. The QA report and screenshot gallery live in `output/qa/android/`.
