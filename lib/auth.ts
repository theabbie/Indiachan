import bcrypt from 'bcrypt';
import { Accounts } from './db/accounts';
import { createSession, destroySession } from './session';
import { verifyTOTP } from './totp';

export async function login(
  username: string,
  password: string,
  twofactor?: string
): Promise<{ success: boolean; error?: string; requiresTwoFactor?: boolean }> {
  const normalizedUsername = username.toLowerCase();
  const account = await Accounts.findOne(normalizedUsername);

  if (!account) {
    return {
      success: false,
      error: 'Incorrect login credentials'
    };
  }

  if (!account.passwordHash) {
    return {
      success: false,
      error: 'Account has no password set'
    };
  }

  const passwordMatch = await bcrypt.compare(password, account.passwordHash);

  if (!passwordMatch) {
    return {
      success: false,
      error: 'Incorrect login credentials'
    };
  }

  if (account.twofactor) {
    if (!twofactor) {
      return {
        success: false,
        requiresTwoFactor: true,
        error: 'Two-factor authentication code required'
      };
    }

    const delta = await verifyTOTP(normalizedUsername, account.twofactor, twofactor);
    if (delta === null) {
      return {
        success: false,
        error: 'Invalid two-factor authentication code'
      };
    }
  }

  await createSession(normalizedUsername);
  await Accounts.updateLastActiveDate(normalizedUsername);

  return { success: true };
}

export async function logout(): Promise<void> {
  await destroySession();
}

export async function register(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const normalizedUsername = username.toLowerCase();
  
  if (username.length < 3 || username.length > 50) {
    return {
      success: false,
      error: 'Username must be 3-50 characters'
    };
  }

  if (password.length < 6 || password.length > 100) {
    return {
      success: false,
      error: 'Password must be 6-100 characters'
    };
  }

  const existing = await Accounts.findOne(normalizedUsername);
  if (existing) {
    return {
      success: false,
      error: 'Account with that username already exists'
    };
  }

  const anonPermissions = Buffer.from([0]).toString('base64');
  await Accounts.insertOne(username, normalizedUsername, password, anonPermissions, false);

  return { success: true };
}
