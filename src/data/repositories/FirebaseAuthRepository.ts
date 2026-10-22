import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  reauthenticateWithCredential,
  deleteUser,
  getIdTokenResult,
  EmailAuthProvider,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from '@react-native-firebase/firestore';
import { IAuthRepository, SignInMethod } from '../../core/domain/repositories';
import { Family } from '../../core/domain/entities';
import { FamilyMapper } from '../mappers/FamilyMapper';
import { AuthError, RecentLoginRequiredError } from '../../core/errors/AppError';

/** Colecciones con un campo `familyId` — se borran al eliminar la cuenta. */
const FAMILY_COLLECTIONS = [
  'catalogCategories',
  'catalogItems',
  'dayActivities',
  'stories',
  'words',
];
/** Colecciones ligadas al perfil (`childId`) en lugar de a la familia. */
const CHILD_COLLECTIONS = ['activities', 'timerSessions'];

/** Firestore admite hasta 500 operaciones por batch. */
const BATCH_LIMIT = 400;

/** Firebase pide volver a autenticarse si el último inicio de sesión fue hace más de ~5 min. */
const RECENT_LOGIN_MS = 5 * 60 * 1000;

export class FirebaseAuthRepository implements IAuthRepository {
  async signInWithEmail(email: string, password: string): Promise<Family> {
    try {
      const cred = await signInWithEmailAndPassword(getAuth(), email, password);
      return this.getFamilyForUid(cred.user.uid);
    } catch (e: any) {
      throw new AuthError(e?.message ?? 'Email sign in failed', e);
    }
  }

  async register(name: string, email: string, password: string, role?: string): Promise<Family> {
    try {
      const cred = await createUserWithEmailAndPassword(getAuth(), email, password);
      const family: Omit<Family, 'id'> = { name, email, role, createdAt: new Date() };
      const db = getFirestore();
      await setDoc(doc(db, 'families', cred.user.uid), FamilyMapper.toFirestore(family));
      return { id: cred.user.uid, ...family };
    } catch (e: any) {
      throw new AuthError(e?.message ?? 'Registration failed', e);
    }
  }

  async signInWithApple(): Promise<Family> {
    throw new Error('Apple sign in not yet implemented');
  }

  async signInWithGoogle(): Promise<Family> {
    throw new Error('Google sign in not yet implemented');
  }

  async signOut(): Promise<void> {
    await signOut(getAuth());
  }

  async getCurrentFamily(): Promise<Family | null> {
    const user = getAuth().currentUser;
    if (!user) return null;
    return this.getFamilyForUid(user.uid);
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(getAuth(), email);
    } catch (e: any) {
      throw new AuthError(e?.message ?? 'Password reset failed', e);
    }
  }

  async updateFamily(id: string, data: Pick<Family, 'name' | 'role'>): Promise<Family> {
    const db = getFirestore();
    await updateDoc(doc(db, 'families', id), { name: data.name, role: data.role ?? null });
    return this.getFamilyForUid(id);
  }

  getSignInMethod(): SignInMethod | null {
    const user = getAuth().currentUser;
    if (!user) return null;
    const providers = user.providerData.map(p => p.providerId);
    // Si la cuenta tiene contraseña, se puede confirmar con ella aunque tenga otros proveedores.
    if (providers.includes('password')) return 'password';
    if (providers.includes('google.com')) return 'google';
    if (providers.includes('apple.com')) return 'apple';
    return 'other';
  }

  async deleteAccount(password?: string): Promise<void> {
    const user = getAuth().currentUser;
    if (!user) throw new AuthError('No hay una sesión iniciada.');

    if (this.getSignInMethod() === 'password' && user.email) {
      try {
        const credential = EmailAuthProvider.credential(user.email, password ?? '');
        await reauthenticateWithCredential(user, credential);
      } catch (e: any) {
        throw new AuthError(e?.message ?? 'Reauthentication failed', e);
      }
    } else if (!(await this.isRecentLogin(user))) {
      // Google/Apple: se revisa ANTES de borrar datos, para no dejar la cuenta a medias.
      // TODO al implementar Apple: revocar el token con revokeToken() (lo exige App Store).
      throw new RecentLoginRequiredError();
    }

    // Primero los datos (las reglas de Firestore piden sesión), luego el usuario.
    await this.deleteFamilyData(user.uid);
    try {
      await deleteUser(user);
    } catch (e: any) {
      if (String(e?.code ?? e?.message).includes('requires-recent-login')) {
        throw new RecentLoginRequiredError();
      }
      throw new AuthError(e?.message ?? 'Delete user failed', e);
    }
  }

  private async isRecentLogin(user: Parameters<typeof deleteUser>[0]): Promise<boolean> {
    try {
      const token = await getIdTokenResult(user);
      return Date.now() - new Date(token.authTime).getTime() < RECENT_LOGIN_MS;
    } catch {
      return false;
    }
  }

  private async deleteFamilyData(familyId: string): Promise<void> {
    const db = getFirestore();
    const refs: any[] = [];

    const children = await getDocs(query(collection(db, 'children'), where('familyId', '==', familyId)));
    const childIds = children.docs.map(d => d.id);

    for (const col of FAMILY_COLLECTIONS) {
      const snap = await getDocs(query(collection(db, col), where('familyId', '==', familyId)));
      snap.docs.forEach(d => refs.push(d.ref));
    }
    for (const col of CHILD_COLLECTIONS) {
      for (const childId of childIds) {
        const snap = await getDocs(query(collection(db, col), where('childId', '==', childId)));
        snap.docs.forEach(d => refs.push(d.ref));
      }
    }
    // Los perfiles y la familia van al final: las reglas de `activities` y
    // `timerSessions` consultan el perfil para saber de quién son.
    children.docs.forEach(d => refs.push(d.ref));
    refs.push(doc(db, 'families', familyId));

    for (let i = 0; i < refs.length; i += BATCH_LIMIT) {
      const batch = writeBatch(db);
      refs.slice(i, i + BATCH_LIMIT).forEach(ref => batch.delete(ref));
      await batch.commit();
    }
  }

  private async getFamilyForUid(uid: string): Promise<Family> {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'families', uid));
    if (!snap.exists()) throw new AuthError('Family not found for user');
    return FamilyMapper.fromFirestore(snap.id, snap.data() as Record<string, any>);
  }
}
