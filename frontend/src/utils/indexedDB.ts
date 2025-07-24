import { openDB } from 'idb';

const DB_NAME = 'absensi-db';
const STORE_NAME = 'absensi';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true, 
        });
      }
    },
  });
}


export async function simpanAbsensiOffline(absenData: any) {
  const db = await getDB();
  await db.add(STORE_NAME, absenData);
  console.log("Disimpan ke IndexedDB:", absenData);
}


export async function ambilSemuaAbsensiOffline() {
  const db = await getDB();
  const data = await db.getAll(STORE_NAME);
  console.log("Data dari IndexedDB:", data);
  return data;
}


export async function hapusAbsensiOffline(id: number) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
  console.log(`Data dengan id ${id} dihapus dari IndexedDB`);
}
