import { headers } from 'next/headers';
import { createHash } from 'crypto';

export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headersList.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return '127.0.0.1';
}

export async function getIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  let rawIp = '127.0.0.1';
  if (forwardedFor) {
    rawIp = forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    rawIp = realIp;
  }

  const cloak = createHash('sha256').update(rawIp + process.env.IP_SALT || 'default-salt').digest('hex').substring(0, 10);

  return {
    raw: rawIp,
    cloak: cloak
  };
}
