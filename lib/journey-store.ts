export interface StationSubmission {
  photoDataUrl: string | null;
  message: string;
  submittedAt: number | null;
}

export interface JourneyState {
  nickname: string;
  submissions: Partial<Record<"1" | "2" | "3" | "4", StationSubmission>>;
  startedAt: number;
  introSeen?: boolean;
  completedAt?: number;
}

const DB_NAME = "bc-tschool-journey";
const STORE_NAME = "journey";
const CURRENT_KEY = "current";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveJourney(state: JourneyState): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(state, CURRENT_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadJourney(): Promise<JourneyState | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(CURRENT_KEY);
    req.onsuccess = () => resolve((req.result as JourneyState) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function clearJourney(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(CURRENT_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
