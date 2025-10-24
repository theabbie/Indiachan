import Redis from 'ioredis';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const kv = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
});

const SESSION_COOKIE_NAME = 'indiachan_session';
const SESSION_TTL = 3 * 24 * 60 * 60;

export interface SessionData {
  user?: string;
  createdAt: number;
  lastActive: number;
}

function generateSessionId(username?: string): string {
  const id = randomBytes(24).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return username ? `${id}:${username}` : id;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) {
    return null;
  }

  const data = await kv.get(`session:${sessionId}`);
  
  if (!data) {
    return null;
  }

  const session = JSON.parse(data as string) as SessionData;
  await kv.expire(`session:${sessionId}`, SESSION_TTL);
  
  return session;
}

export async function createSession(username: string): Promise<string> {
  const sessionId = generateSessionId(username);
  const sessionData: SessionData = {
    user: username,
    createdAt: Date.now(),
    lastActive: Date.now()
  };

  await kv.set(`session:${sessionId}`, JSON.stringify(sessionData), 'EX', SESSION_TTL);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_TTL,
    path: '/'
  });

  return sessionId;
}

export async function updateSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) {
    return;
  }

  const data = await kv.get(`session:${sessionId}`);
  
  if (data) {
    const session = JSON.parse(data as string) as SessionData;
    session.lastActive = Date.now();
    await kv.set(`session:${sessionId}`, JSON.stringify(session), 'EX', SESSION_TTL);
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (sessionId) {
    await kv.del(`session:${sessionId}`);
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export async function getSessionUser(): Promise<string | null> {
  const session = await getSession();
  return session?.user || null;
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }
  return session;
}
