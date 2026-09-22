# Kataleya

🚧 **Status: beta** — real, tested, in daily use; still pre-1.0 on purpose. See
[Status](#status).

A privacy-first recovery companion PWA — installable, works fully offline, no backend required
for any core feature. Colored throughout by
[Circadian Canonical Hours](#circadian-canonical-hours) — the design language that originated
here and now runs across the whole `kontor.studio` project family.

**Live:** https://kontor.studio/kataleya-demo/ · **Android (beta):** see
[`kataleya-android`](https://github.com/kwasikontor45/kataleya-android)

## What it is

Kataleya supports someone in recovery with tools that respect that this is sensitive, personal
territory:

- A 24-hour circadian "room" screen (clock, breathing orb, hour-scars for hard moments)
- Guided breathing (4-7-8 / box / coherent), a grounding (5-4-3-2-1) exercise, urge-surfing
- A private journal ("vault"), clinician-PIN protected
- Real end-to-end encrypted sponsor/sponsee pairing ("send a light") — X25519 + XChaCha20-Poly1305,
  vendored (not CDN-loaded) so the app keeps working from a plain offline file with zero internet
  at all
- **Word-form attunement codes** — the pairing key reads as 32 plain-English words (drawn from a
  256-word list with zero confusable pairs, round-trip tested against 20,000 random keys) instead
  of 64 raw hex characters. Old hex codes still work.
- **A verification phrase** — 4 words, Signal's "safety numbers" pattern: a real check against a
  tampered/swapped pairing code, not decoration. Symmetric regardless of who initiated, tested
  against 5,000 random keypairs.
- Native OS share-sheet support for sending a pairing code, alongside the manual copy/paste
  fallback (which always works, zero connection required)

The manual copy/paste pairing flow always works fully offline; `relay-worker/` is a small,
optional Cloudflare Worker that adds automatic delivery + a 24h history when both devices are
online — it only ever sees already-encrypted ciphertext and a one-way-derived channel id, never
the message itself or the shared secret.

## Circadian Canonical Hours

Four phases, each a distinct hour range and accent color: `choice` 6–11 (`#5ec8ed`), `desire`
11–17 (`#f6c177`), `still-pine` 17–21 (`#c4a7e7`), `nyx` 21–6 (`#ea9a97`). This app is where the
system started; it's since spread to every other project in this family (see e.g.
[`phoenix`](https://github.com/kwasikontor45/phoenix)'s `src/lib/cch.js`). If you're building
something new in this space, reuse the palette rather than re-deriving it — that consistency is
the actual point of it being a named, documented system instead of one app's color scheme.

## Fork it — what to change first

- **`RELAY_URL`** (search `index.html`) points at the original author's own Cloudflare Worker.
  Deploy your own (`cd relay-worker && wrangler deploy`) and update the constant — otherwise a
  fork's auto-relay traffic routes through infrastructure you don't control. See the comment right
  above that constant for the full reasoning.
- **`manifest.json`** — name, colors, icons are all yours to change; nothing else depends on them.
- The pairing/journal/room *content* (copy, prompts) is meant to be forked and rewritten for
  whatever your own context needs — this was written for one specific recovery journey, not as a
  neutral template.

## Structure

- `index.html` — the app itself (single-file PWA, no build step)
- `vendor/` — vendored crypto (`@noble/curves` + `@noble/ciphers`, MIT licensed)
- `sw.js` — service worker (offline app-shell caching)
- `relay-worker/` — optional Cloudflare Worker for the pairing feature's automatic-delivery layer

## Stack

Vanilla JS/HTML/CSS, no framework, no build step. Deployed as a static site (Cloudflare Pages).
The relay worker is a small standalone Cloudflare Worker + KV.

## Status

Beta — the crypto and pairing mechanism are real and independently tested (see the round-trip and
symmetry numbers above), but this hasn't been through any formal security audit, and the surface
area (room/mirror/vault/journal) is still evolving. Treat it the way you'd treat any beta: useful
and used daily, not yet the thing to bet something high-stakes on without reading the code first.

## This is not medical, clinical, or crisis software

Kataleya is a personal support tool, not a substitute for professional treatment. If you or
someone you're supporting is in crisis: 988 (call or text), Crisis Text Line (text HOME to
741741), or your local emergency number — not this app, not any software.

## License

MIT — see [`LICENSE`](./LICENSE). Fork it, rebrand it, ship it under your own name; the only
requirement is keeping the original copyright notice. The vendored crypto (`vendor/`) carries its
own MIT notices from `@noble/curves`/`@noble/ciphers` — check those files if you strip anything
out. The "Kataleya" name and `kontor.studio` branding aren't part of this grant — rename before
redistributing if you don't want it read as an official release.
