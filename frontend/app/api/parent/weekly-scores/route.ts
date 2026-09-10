import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PARENT_PORTAL_ORIGIN = 'https://wewin.baobai.edu.vn';
const AUTH_MESSAGE = 'Phiên đăng nhập game không hợp lệ hoặc đã hết hạn.';

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': PARENT_PORTAL_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    Vary: 'Origin',
    'Cache-Control': 'no-store',
  };
}

function jsonResponse(body: unknown, status: number) {
  return NextResponse.json(body, { status, headers: corsHeaders() });
}

function backendBaseUrl() {
  return String(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
}

function portalSecret() {
  const secret =
    process.env.PORTAL_SSO_SECRET?.trim() ||
    process.env.GAME_SSO_SECRET?.trim() ||
    '';
  return secret.length >= 16 ? secret : '';
}

function fromBase64Url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, 'base64');
}

function readBearerToken(header: string | null): string {
  const match = /^Bearer\s+(\S+)/i.exec(String(header || '').trim());
  return match?.[1] || '';
}

function verifyPortalSsoToken(token: string): string | null {
  const raw = String(token || '').trim();
  const secret = portalSecret();
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
      pwd?: unknown;
      exp?: unknown;
    };
    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number' && payload.exp < now) return null;
    const sid = typeof payload.sid === 'string' ? payload.sid.trim() : '';
    const pwd = typeof payload.pwd === 'string' ? payload.pwd.trim() : '';
    return sid && pwd ? sid : null;
  } catch {
    return null;
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(req: Request) {
  const sid = verifyPortalSsoToken(readBearerToken(req.headers.get('authorization')));
  if (!sid) {
    return jsonResponse({ ok: false, message: AUTH_MESSAGE }, 401);
  }

  const requestedStudentId = new URL(req.url).searchParams.get('studentId')?.trim() || '';
  if (requestedStudentId && requestedStudentId !== sid) {
    return jsonResponse({ ok: false, message: AUTH_MESSAGE }, 401);
  }

  const base = backendBaseUrl();
  const secret = portalSecret();
  if (!base || !secret) {
    return jsonResponse({ ok: false, message: 'Lỗi hệ thống' }, 500);
  }

  const incoming = new URL(req.url);
  const upstream = new URL('/parent/weekly-scores', `${base}/`);
  incoming.searchParams.forEach((value, key) => {
    upstream.searchParams.set(key, value);
  });
  upstream.searchParams.set('studentId', sid);

  try {
    const response = await fetch(upstream, {
      method: 'GET',
      headers: {
        'X-WeWin-Portal-Key': secret,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12000),
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        ...corsHeaders(),
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return jsonResponse({ ok: false, message: 'Lỗi hệ thống' }, 500);
  }
}
