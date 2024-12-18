import type { User } from '../../types';

export interface AuthCredentials {
  [loginId: string]: string; // loginId -> password mapping
}

export interface AuthState {
  credentials: AuthCredentials;
  initialized: boolean;
}

export interface AuthManager {
  verifyCredential: (loginId: string, password: string) => boolean;
  addCredential: (loginId: string, password: string) => void;
  removeCredential: (loginId: string) => void;
  getCredentials: () => AuthCredentials;
  reset: () => void;
}