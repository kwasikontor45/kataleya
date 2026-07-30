# Kataleya

A privacy-first recovery companion PWA — installable, works fully offline, no backend required for any core feature.

**Live:** https://kontor.studio/kataleya-demo/

## What it is

Kataleya supports someone in recovery with tools that respect that this is sensitive, personal territory:

- A 24-hour circadian "room" screen (clock, breathing orb, hour-scars for hard moments)
- Guided breathing (4-7-8 / box / coherent), a grounding (5-4-3-2-1) exercise, urge-surfing
- A private journal ("vault"), clinician-PIN protected
- Real end-to-end encrypted sponsor/sponsee pairing ("send a light") — X25519 + XChaCha20-Poly1305,
  vendored (not CDN-loaded) so the app keeps working from a plain offline file open with zero
  internet at all. The manual copy/paste flow always works with no connection; `relay-worker/`
  is a small, optional Cloudflare Worker that adds automatic delivery + a 24h history when both
  devices are online — it only ever sees already-encrypted ciphertext, never the message itself.

## Structure

- `index.html` — the app itself (single-file PWA, no build step)
- `vendor/` — vendored crypto (`@noble/curves` + `@noble/ciphers`, MIT licensed)
- `sw.js` — service worker (offline app-shell caching)
- `relay-worker/` — optional Cloudflare Worker for the pairing feature's automatic-delivery layer

## Stack

Vanilla JS/HTML/CSS, no framework, no build step. Deployed as a static site (Cloudflare Pages).
The relay worker is a small standalone Cloudflare Worker + KV.
