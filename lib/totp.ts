import { TOTP, Secret } from 'otpauth';
import Redis from 'ioredis';

const kv = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
});

export function generateTOTPSecret(): string {
  const secret = new Secret({ size: 20 });
  return secret.base32;
}

export async function verifyTOTP(username: string, totpSecret: string, userInput: string): Promise<number | null> {
  if (!userInput || userInput.length !== 6) {
    return null;
  }

  const totp = new TOTP({
    secret: totpSecret,
    algorithm: 'SHA256',
  });

  const delta = totp.validate({
    token: userInput,
    window: 1,
  });

  if (delta !== null) {
    const key = `twofactor_success:${username}:${userInput}`;
    const uses = await kv.incr(key);
    await kv.expire(key, 30);
    if (uses && uses > 1) {
      return null;
    }
  }

  return delta;
}

export function generateTOTPUri(username: string, secret: string, issuer: string = 'Indiachan'): string {
  const totp = new TOTP({
    issuer,
    label: username,
    secret,
    algorithm: 'SHA256',
  });
  return totp.toString();
}
