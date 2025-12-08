import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, Session } from '@/types/project';
import { saveUser, getUserByEmail, getUserById } from './storage';

const AUTH_COOKIE_NAME = 'dlm_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================
// PASSWORD HASHING
// ============================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================
// SESSION MANAGEMENT
// ============================================

function encodeSession(session: Session): string {
  const authSecret = process.env.AUTH_SECRET || 'fallback-secret';
  const payload = JSON.stringify(session);
  // Simple encoding - in production use proper JWT
  return Buffer.from(`${payload}|${authSecret}`).toString('base64');
}

function decodeSession(token: string): Session | null {
  try {
    const authSecret = process.env.AUTH_SECRET || 'fallback-secret';
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [payload, secret] = decoded.split('|');
    
    if (secret !== authSecret) return null;
    
    const session = JSON.parse(payload) as Session;
    
    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

export async function createSession(user: User): Promise<string> {
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    expiresAt: new Date(Date.now() + SESSION_DURATION).toISOString(),
  };
  
  return encodeSession(session);
}

export async function setSessionCookie(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);
  
  if (!sessionCookie?.value) return null;
  
  return decodeSession(sessionCookie.value);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  
  return getUserById(session.userId);
}

// ============================================
// AUTH ACTIONS
// ============================================

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<AuthResult> {
  // Check if user exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { success: false, error: 'Email already registered' };
  }
  
  // Validate password
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }
  
  // Create user
  const user: User = {
    id: uuidv4(),
    email: email.toLowerCase().trim(),
    passwordHash: await hashPassword(password),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  
  await saveUser(user);
  
  // Create session
  const sessionToken = await createSession(user);
  await setSessionCookie(sessionToken);
  
  return { success: true, user };
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  const user = await getUserByEmail(email.toLowerCase().trim());
  
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return { success: false, error: 'Invalid email or password' };
  }
  
  // Create session
  const sessionToken = await createSession(user);
  await setSessionCookie(sessionToken);
  
  return { success: true, user };
}

export async function signOut(): Promise<void> {
  await clearSessionCookie();
}

