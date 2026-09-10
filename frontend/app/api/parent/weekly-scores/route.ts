import { NextResponse } from 'next/server';

const PARENT_PORTAL_ORIGIN = 'https://wewin.baobai.edu.vn';

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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(req: Request) {
  const base = backendBaseUrl();
  if (!base) {
    return jsonResponse({ ok: false, message: 'Lỗi hệ thống' }, 500);
  }

  const incoming = new URL(req.url);
  const upstream = new URL('/parent/weekly-scores', `${base}/`);
  incoming.searchParams.forEach((value, key) => {
    upstream.searchParams.set(key, value);
  });

  try {
    const response = await fetch(upstream, {
      method: 'GET',
      headers: {
        Authorization: req.headers.get('authorization') || '',
      },
      cache: 'no-store',
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
