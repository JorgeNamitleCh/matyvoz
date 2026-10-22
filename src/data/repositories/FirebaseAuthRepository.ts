import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from '@react-native-firebase/firestore';
import { IAuthRepository } from '../../core/domain/repositories';
import { Family } from '../../core/domain/entities';
import { FamilyMapper } from '../mappers/FamilyMapper';
import { AuthError } from '../../core/errors/AppError';

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

  private async getFamilyForUid(uid: string): Promise<Family> {
    const db = getFirestore();
    const snap = await getDoc(doc(db, 'families', uid));
    if (!snap.exists()) throw new AuthError('Family not found for user');
    return FamilyMapper.fromFirestore(snap.id, snap.data() as Record<string, any>);
  }
}
