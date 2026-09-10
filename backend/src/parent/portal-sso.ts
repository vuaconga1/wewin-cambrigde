import { createHmac, timingSafeEqual } from 'crypto';

export const PARENT_WEEKLY_AUTH_MESSAGE =
  'Phiên đăng nhập game không hợp lệ hoặc đã hết hạn.';

export type PortalSsoClaims = {
  sid: string;
  name: string;
  pwd: string;
};

function portalSsoSecret(): string | null {
  const secret =
    process.env.PORTAL_SSO_SECRET?.trim() ||
    process.env.GAME_SSO_SECRET?.trim() ||
    '';
  if (!secret || secret.length < 16) return null;
  return secret;
}

function fromBase64Url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, 'base64');
}

export function readBearerToken(header: string | undefined): string {
  const match = /^Bearer\s+(\S+)/i.exec(String(header || '').trim());
  return match?.[1] || '';
}

export function verifyPortalSsoToken(token: string): PortalSsoClaims | null {
  const raw = String(token || '').trim();
  const secret = portalSsoSecret();
  if (!raw || !secret) return null;

  const parts = raw.split('.');
  if (parts.length !== 3) return null;

  const [headerPart, payloadPart, signaturePart] = parts;
  const expected = createHmac('sha256', secret)
    .update(`${headerPart}.${payloadPart}`)
    .digest();
  const actual = fromBase64Url(signaturePart);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadPart).toString('utf8')) as {
      sid?: unknown;
      name?: unknown;
      pwd?: unknown;
      exp?: unknown;
    };
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number' && payload.exp < now) return null;
    const sid = typeof payload.sid === 'string' ? payload.sid.trim() : '';
    const pwd = typeof payload.pwd === 'string' ? payload.pwd.trim() : '';
    const nameRaw = typeof payload.name === 'string' ? payload.name.trim() : '';
    if (!sid || !pwd) return null;
    return { sid, name: nameRaw || sid, pwd };
  } catch {
    return null;
  }
}
