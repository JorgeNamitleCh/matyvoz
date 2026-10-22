import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useCatalogStore } from '../stores/useCatalogStore';
import { useDayStore } from '../stores/useDayStore';
import { useStoriesStore } from '../stores/useStoriesStore';
import { useWordsStore } from '../stores/useWordsStore';

/**
 * Carga desde Firestore los datos de la familia con sesión iniciada
 * (catálogo + Mi día) y los limpia al cerrar sesión.
 */
export function useFamilyData() {
  const familyId = useAuthStore(state => state.family?.id);

  useEffect(() => {
    if (!familyId) {
      useCatalogStore.getState().reset();
      useDayStore.getState().reset();
      useStoriesStore.getState().reset();
      useWordsStore.getState().reset();
      return;
    }
    useCatalogStore.getState().load(familyId);
    useDayStore.getState().load(familyId);
    useStoriesStore.getState().load(familyId);
    useWordsStore.getState().load(familyId);
  }, [familyId]);
}
