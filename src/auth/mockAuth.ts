/**
 * Session-only authentication mock for the frontend portfolio demo.
 * Accounts live only in this module's memory and disappear on page reload.
 */
type DemoAccount = { password: string };
export type DemoAuthResult = { ok: true } | { ok: false; message: string };

const demoAccounts = new Map<string, DemoAccount>();

export function signUpDemoAccount(email: string, password: string): DemoAuthResult {
  const normalizedEmail = email.trim().toLowerCase();
  if (demoAccounts.has(normalizedEmail)) {
    return { ok: false, message: 'A demo profile already exists for this email. Sign in instead.' };
  }
  demoAccounts.set(normalizedEmail, { password });
  return { ok: true };
}

export function signInDemoAccount(email: string, password: string): DemoAuthResult {
  const account = demoAccounts.get(email.trim().toLowerCase());
  if (!account || account.password !== password) {
    return { ok: false, message: 'We could not find a matching demo profile. Create a profile first.' };
  }
  return { ok: true };
}
