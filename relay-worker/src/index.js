// kataleya-relay-worker — a blind ciphertext relay for the "send a light"
// pairing feature in kataleya-demo (see kataleya-demo/index.html, the
// pcEncryptSignal/pcDecryptSignal functions and the block comment above them).
//
// This worker NEVER sees plaintext. The channelId is a one-way SHA-256 hash
// of the pair's locally-derived X25519 shared secret (computed client-side,
// see pcGetChannelId in index.html) — knowing channelId does not reveal the
// secret, and this worker never receives the secret itself. All it stores is
// already-encrypted "light" codes (identical format to the existing manual
// copy/paste flow) plus a timestamp, auto-expiring after 24h. This exists to
// automate delivery + give a short rolling history instead of manual paste —
// the manual flow in index.html keeps working unchanged with zero internet,
// this is a purely additive, best-effort layer on top.

const CHANNEL_RE = /^[0-9a-f]{64}$/;
const MAX_CODE_LEN = 512;   // generous — real codes are ~120 chars
const MAX_HISTORY = 20;     // cap per channel, oldest dropped first
const TTL_SECONDS = 86400;  // 24h, matches the feature's own naming

const ALLOWED_ORIGINS = new Set([
  'https://kontor.studio',
  'https://www.kontor.studio',
]);

function corsHeaders(origin) {
  const h = new Headers();
  h.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type');
  h.set('Content-Type', 'application/json');
  if (ALLOWED_ORIGINS.has(origin)) h.set('Access-Control-Allow-Origin', origin);
  return h;
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(origin) });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '';
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const parts = url.pathname.split('/').filter(Boolean); // ['relay', ':channelId']
    if (parts[0] !== 'relay' || !parts[1]) {
      return json({ error: 'not found' }, 404, origin);
    }
    const channelId = parts[1].toLowerCase();
    if (!CHANNEL_RE.test(channelId)) {
      return json({ error: 'invalid channel' }, 400, origin);
    }
    const kvKey = `relay:${channelId}`;

    if (request.method === 'GET') {
      const raw = await env.KATALEYA_RELAY.get(kvKey);
      const list = raw ? JSON.parse(raw) : [];
      return json({ items: list }, 200, origin);
    }

    if (request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { return json({ error: 'invalid json' }, 400, origin); }
      const code = typeof body?.code === 'string' ? body.code.trim() : '';
      if (!code || code.length > MAX_CODE_LEN) {
        return json({ error: 'invalid code' }, 400, origin);
      }
      const raw = await env.KATALEYA_RELAY.get(kvKey);
      const list = raw ? JSON.parse(raw) : [];
      list.push({ code, at: Date.now() });
      while (list.length > MAX_HISTORY) list.shift();
      await env.KATALEYA_RELAY.put(kvKey, JSON.stringify(list), { expirationTtl: TTL_SECONDS });
      return json({ ok: true }, 200, origin);
    }

    return json({ error: 'method not allowed' }, 405, origin);
  },
};
