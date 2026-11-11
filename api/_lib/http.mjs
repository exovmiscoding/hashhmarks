const MAX_BODY = 20_000;

export function json(res, status, payload, headers = {}) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

export function fail(res, status, error) {
  json(res, status, { error });
}

export async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > MAX_BODY) throw new Error('Request body is too large');
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('Request body must be valid JSON');
  }
}

export function parseCookies(header = '') {
  const out = {};
  for (const part of String(header).split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (key) out[key] = decodeURIComponent(part.slice(index + 1).trim());
  }
  return out;
}

export function isSecureRequest(req) {
  const proto = req.headers['x-forwarded-proto'];
  if (proto) return String(proto).split(',')[0].trim() === 'https';
  return Boolean(req.socket?.encrypted);
}

export function sessionCookie(token, maxAgeSeconds, secure) {
  const parts = [
    `hm_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return forwarded ? String(forwarded).split(',')[0].trim() : req.socket?.remoteAddress ?? 'unknown';
}
