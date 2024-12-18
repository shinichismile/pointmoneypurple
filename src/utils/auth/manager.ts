import { getCredentials, addCredential, removeCredential, verifyCredential, resetAuth } from './storage';
import type { AuthManager } from './types';

class AuthManagerImpl implements AuthManager {
  private static instance: AuthManagerImpl;

  private constructor() {}

  static getInstance(): AuthManagerImpl {
    if (!AuthManagerImpl.instance) {
      AuthManagerImpl.instance = new AuthManagerImpl();
    }
    return AuthManagerImpl.instance;
  }

  verifyCredential(loginId: string, password: string): boolean {
    return verifyCredential(loginId, password);
  }

  addCredential(loginId: string, password: string): void {
    addCredential(loginId, password);
  }

  removeCredential(loginId: string): void {
    removeCredential(loginId);
  }

  getCredentials(): Record<string, string> {
    return getCredentials();
  }

  reset(): void {
    resetAuth();
  }
}

export const authManager = AuthManagerImpl.getInstance();