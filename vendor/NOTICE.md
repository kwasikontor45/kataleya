# vendor/kataleya-crypto.bundle.js

Bundled from `@noble/curves` and `@noble/ciphers` (both MIT licensed, © Paul Miller),
built with esbuild. Exposes exactly two primitives as `window.KataleyaCrypto`:
X25519 key exchange and XChaCha20-Poly1305 authenticated encryption — used by the
sponsor/sponsee pairing feature.

Vendored (not loaded from a CDN) on purpose: this app has no other third-party
runtime dependency and is meant to keep working from a plain `file://` open with
no internet at all — a CDN script tag would quietly break that property the
moment the CDN was unreachable.

To rebuild after a version bump: see the bundling command in GAMEPLAN.md's
2026-07-28 pairing-feature entry, or re-run `esbuild entry.js --bundle --minify
--format=iife` against a fresh `entry.js` importing the same two functions.
