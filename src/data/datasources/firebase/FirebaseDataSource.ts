import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

export type DocSnapshot = FirebaseFirestoreTypes.DocumentSnapshot;
export type QuerySnapshot = FirebaseFirestoreTypes.QuerySnapshot;

export class FirebaseDataSource {
  protected db = firestore();

  protected collection(name: string) {
    return this.db.collection(name);
  }

  protected async getDoc(collection: string, id: string): Promise<DocSnapshot> {
    return this.db.collection(collection).doc(id).get();
  }

  protected async addDoc(
    collection: string,
    data: Record<string, unknown>,
  ): Promise<FirebaseFirestoreTypes.DocumentReference> {
    return this.db.collection(collection).add(data);
  }

  protected async setDoc(
    collection: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    return this.db.collection(collection).doc(id).set(data);
  }

  protected async updateDoc(
    collection: string,
    id: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    return this.db.collection(collection).doc(id).update(data);
  }

  protected async deleteDoc(collection: string, id: string): Promise<void> {
    return this.db.collection(collection).doc(id).delete();
  }
}
