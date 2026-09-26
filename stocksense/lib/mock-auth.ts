export interface MockSession {
  email: string;
  name: string;
  authenticatedAt: number;
}

const STORAGE_KEY = "ss_mock_auth";

let cachedRaw: string | null = undefined as unknown as string | null;
let cachedSession: MockSession | null = null;

export function getMockSession(): MockSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  if (!raw) {
    cachedSession = null;
    return null;
  }
  try {
    cachedSession = JSON.parse(raw) as MockSession;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

export function setMockSession(session: Omit<MockSession, "authenticatedAt">): void {
  if (typeof window === "undefined") return;
  const full: MockSession = { ...session, authenticatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  cachedRaw = undefined as unknown as string | null;
  notifyMockSessionListeners();
}

export function clearMockSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  cachedRaw = undefined as unknown as string | null;
  notifyMockSessionListeners();
}

export function isMockAuthenticated(): boolean {
  return getMockSession() !== null;
}

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToMockSession(listener: Listener): () => void {
  listeners.add(listener);
  function onStorage(e: StorageEvent) {
    if (e.key === STORAGE_KEY) {
      cachedRaw = undefined as unknown as string | null;
      listener();
    }
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function notifyMockSessionListeners(): void {
  listeners.forEach((l) => l());
}
