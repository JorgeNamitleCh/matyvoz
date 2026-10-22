import { Family } from '../entities';

/** Cómo inició sesión el usuario actual. */
export type SignInMethod = 'password' | 'google' | 'apple' | 'other';

export interface IAuthRepository {
  signInWithApple(): Promise<Family>;
  signInWithGoogle(): Promise<Family>;
  signInWithEmail(email: string, password: string): Promise<Family>;
  register(name: string, email: string, password: string, role?: string): Promise<Family>;
  signOut(): Promise<void>;
  getCurrentFamily(): Promise<Family | null>;
  sendPasswordReset(email: string): Promise<void>;
  updateFamily(id: string, data: Pick<Family, 'name' | 'role'>): Promise<Family>;
  getSignInMethod(): SignInMethod | null;
  /**
   * Borra para siempre la cuenta y TODOS sus datos (familia, perfil,
   * actividades, historias, palabras, catálogo). El proveedor exige un inicio
   * de sesión reciente: con correo se confirma con `password`; con Google/Apple
   * lanza RecentLoginRequiredError (sin borrar nada) si la sesión no es reciente.
   */
  deleteAccount(password?: string): Promise<void>;
}
