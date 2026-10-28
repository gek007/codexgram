# Isolated visual review

Run `node qa/visual/server.mjs` from the repository root, then open
`http://127.0.0.1:5193/?screen=home` at 393×852.

`entry.jsx` lists the supported fixture screens. Screens render real feature
components. The alias configuration replaces Clerk, Convex, navigation, media,
uploads, and local drafts with local fixtures. There is no product route, auth
bypass, backend seeding, or deployment of this harness. Mock mutations never
leave the browser. Camera/library behavior and system dialogs need native QA.
The fixture navigation frame and tabs are illustrative; native screenshots
verify the real app shell separately.

The `fixtures/` photographs are test-only crops from the supplied boards. They
are never imported by app source code. `extract-design-assets.py` also copies
isolated decorative artwork into `assets/design/`; its original boards stay
unchanged. It removes the white matte from decorative images for dark mode.

Capture screens with the Playwright connector, then run
`python3 qa/visual/build-report.py` (Pillow required) to assemble
`output/qa/fidelity/comparison.html` and the contact sheet.

These are visual-review fixtures, not end-to-end authentication or device tests.
