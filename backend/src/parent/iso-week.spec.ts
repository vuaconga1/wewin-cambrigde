import { createHmac } from 'crypto';
import { parseIsoWeekKey, parseIsoWeekYearAndWeek, getIsoWeekAndYear } from './iso-week';
import { verifyPortalSsoToken } from './portal-sso';

function padBase64Url(buf: Buffer) {
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signHs256(sid: string, secret: string, expOffsetSec = 180) {
  const header = padBase64Url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const now = Math.floor(Date.now() / 1000);
  const payload = padBase64Url(
    Buffer.from(
      JSON.stringify({
        sid,
        name: sid,
        pwd: '123',
        iat: now,
        exp: now + expOffsetSec,
      }),
    ),
  );
  const sig = padBase64Url(
    createHmac('sha256', secret).update(`${header}.${payload}`).digest(),
  );
  return `${header}.${payload}.${sig}`;
}

describe('ISO week windows', () => {
  it('maps 22/04, 24/04 and 26/04/2026 to 2026-W17 and 27/04 to W18', () => {
    expect(getIsoWeekAndYear(2026, 4, 22)).toEqual({ weekYear: 2026, isoWeek: 17 });
    expect(getIsoWeekAndYear(2026, 4, 24)).toEqual({ weekYear: 2026, isoWeek: 17 });
    expect(getIsoWeekAndYear(2026, 4, 26)).toEqual({ weekYear: 2026, isoWeek: 17 });
    expect(getIsoWeekAndYear(2026, 4, 27)).toEqual({ weekYear: 2026, isoWeek: 18 });
  });

  it('uses Monday–Sunday bounds in Ho Chi Minh for 2026-W17', () => {
    const week = parseIsoWeekKey('2026-W17');
    expect(week).toMatchObject({
      weekKey: '2026-W17',
      isoWeek: 17,
      weekYear: 2026,
      rangeLabel: '20/04 – 26/04/2026',
    });
    expect(week?.start.toISOString()).toBe('2026-04-19T17:00:00.000Z');
    expect(week?.end.toISOString()).toBe('2026-04-26T17:00:00.000Z');
  });

  it('accepts week+year and rejects an impossible ISO week', () => {
    expect(parseIsoWeekYearAndWeek('2026', '17')?.weekKey).toBe('2026-W17');
    expect(parseIsoWeekKey('2026-W54')).toBeNull();
    expect(parseIsoWeekKey('2026-W7')).toBeNull();
  });
});

describe('portal SSO JWT', () => {
  const secret = 'test-portal-sso-secret-32chars!!';

  beforeEach(() => {
    process.env.PORTAL_SSO_SECRET = secret;
  });

  afterEach(() => {
    delete process.env.PORTAL_SSO_SECRET;
  });

  it('verifies a HS256 token with sid', () => {
    const token = signHs256('HV-1602', secret);
    expect(verifyPortalSsoToken(token)).toMatchObject({ sid: 'HV-1602', pwd: '123' });
  });

  it('rejects expired or garbage tokens', () => {
    expect(verifyPortalSsoToken(signHs256('HV-1602', secret, -10))).toBeNull();
    expect(verifyPortalSsoToken('not.a.jwt')).toBeNull();
    expect(verifyPortalSsoToken('')).toBeNull();
  });
});
