import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { useAuthStore } from '../stores/useAuthStore';
import { FirebaseAuthRepository } from '../../data/repositories/FirebaseAuthRepository';

const authRepo = new FirebaseAuthRepository();

export function useAuth() {
  const { setFamily, setLoading, signOut } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async user => {
      if (!user) {
        signOut();
        setLoading(false);
        return;
      }
      try {
        const family = await authRepo.getCurrentFamily();
        setFamily(family);
      } catch {
        signOut();
      }
    });
    return unsubscribe;
  }, []);
}
