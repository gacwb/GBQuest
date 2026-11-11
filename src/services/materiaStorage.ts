import { Materia, Bloco } from '../types';

const DB_NAME = 'gbquest_data_hub';
const DB_VERSION = 1;
const STORE_MATERIAS = 'materias';
const STORE_BLOCOS = 'blocos';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_MATERIAS)) {
        db.createObjectStore(STORE_MATERIAS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BLOCOS)) {
        db.createObjectStore(STORE_BLOCOS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ----------------------------------------------------
// BLOCOS
// ----------------------------------------------------
export async function idbCarregarBlocos(): Promise<Bloco[]> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_BLOCOS, 'readonly');
      const store = tx.objectStore(STORE_BLOCOS);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as Bloco[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function idbSalvarBloco(bloco: Bloco): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_BLOCOS, 'readwrite');
    tx.objectStore(STORE_BLOCOS).put(bloco);
  } catch (e) {
    console.warn('Erro ao salvar bloco no IndexedDB:', e);
  }
}

export async function idbExcluirBloco(id: number | string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_BLOCOS, 'readwrite');
    tx.objectStore(STORE_BLOCOS).delete(id);
  } catch (e) {
    console.warn('Erro ao excluir bloco no IndexedDB:', e);
  }
}

// ----------------------------------------------------
// MATERIAS (COM TEXTOS COMPLETOS E ARQUIVOS)
// ----------------------------------------------------
export async function idbCarregarMaterias(): Promise<Materia[]> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_MATERIAS, 'readonly');
      const store = tx.objectStore(STORE_MATERIAS);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as Materia[]) || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function idbSalvarMateria(materia: Materia): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_MATERIAS, 'readwrite');
    tx.objectStore(STORE_MATERIAS).put(materia);
  } catch (e) {
    console.warn('Erro ao salvar matéria no IndexedDB:', e);
  }
}

export async function idbExcluirMateria(id: number | string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_MATERIAS, 'readwrite');
    tx.objectStore(STORE_MATERIAS).delete(id);
  } catch (e) {
    console.warn('Erro ao excluir matéria no IndexedDB:', e);
  }
}

export async function idbLimparTudo(): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction([STORE_BLOCOS, STORE_MATERIAS], 'readwrite');
    tx.objectStore(STORE_BLOCOS).clear();
    tx.objectStore(STORE_MATERIAS).clear();
  } catch (e) {
    console.warn('Erro ao limpar IndexedDB:', e);
  }
}
