import firestore from '@react-native-firebase/firestore';
import { FirebaseDataSource } from '../datasources/firebase/FirebaseDataSource';
import { ICatalogRepository } from '../../core/domain/repositories';
import { CatalogCategory, CatalogItem } from '../../core/domain/entities';
import { CatalogMapper } from '../mappers/CatalogMapper';

const CATEGORIES = 'catalogCategories';
const ITEMS = 'catalogItems';

export class FirebaseCatalogRepository extends FirebaseDataSource implements ICatalogRepository {
  async getCategories(familyId: string): Promise<CatalogCategory[]> {
    const snap = await this.collection(CATEGORIES).where('familyId', '==', familyId).get();
    return snap.docs.map(d => CatalogMapper.categoryFromFirestore(d.id, d.data()));
  }

  async getItems(familyId: string): Promise<CatalogItem[]> {
    const snap = await this.collection(ITEMS).where('familyId', '==', familyId).get();
    return snap.docs.map(d => CatalogMapper.itemFromFirestore(d.id, d.data()));
  }

  saveCategory(familyId: string, category: CatalogCategory): Promise<void> {
    return this.setDoc(CATEGORIES, category.id, CatalogMapper.categoryToFirestore(familyId, category));
  }

  saveItem(familyId: string, item: CatalogItem): Promise<void> {
    return this.setDoc(ITEMS, item.id, CatalogMapper.itemToFirestore(familyId, item));
  }

  updateItem(id: string, changes: Partial<Omit<CatalogItem, 'id'>>): Promise<void> {
    // `undefined` explícito = borrar el campo (ej. quitar la foto).
    const data: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(changes)) {
      data[k] = v === undefined ? firestore.FieldValue.delete() : v;
    }
    return this.updateDoc(ITEMS, id, data);
  }

  deleteItem(id: string): Promise<void> {
    return this.deleteDoc(ITEMS, id);
  }

  async saveMany(familyId: string, categories: CatalogCategory[], items: CatalogItem[]): Promise<void> {
    const batch = this.db.batch();
    categories.forEach((c, i) =>
      batch.set(
        this.collection(CATEGORIES).doc(c.id),
        CatalogMapper.categoryToFirestore(familyId, { ...c, order: c.order ?? i }),
      ),
    );
    items.forEach(it =>
      batch.set(this.collection(ITEMS).doc(it.id), CatalogMapper.itemToFirestore(familyId, it)),
    );
    await batch.commit();
  }
}
