import { Family } from '../entities';

export interface IAuthRepository {
  signInWithApple(): Promise<Family>;
  signInWithGoogle(): Promise<Family>;
  signInWithEmail(email: string, password: string): Promise<Family>;
  register(name: string, email: string, password: string, role?: string): Promise<Family>;
  signOut(): Promise<void>;
  getCurrentFamily(): Promise<Family | null>;
}
