// Safe LocalStorage & SessionStorage fallback for iframe environments where window.localStorage throws SecurityError
const createInMemoryStorage = (): Storage => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => {
      Object.keys(store).forEach(k => delete store[k]);
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() { return Object.keys(store).length; }
  };
};

export const safeLocalStorage: Storage = (() => {
  try {
    const test = window.localStorage;
    test.getItem('__test_sandbox__');
    return window.localStorage;
  } catch (e) {
    console.warn('[Sandbox] LocalStorage is blocked or inaccessible. Fallback to in-memory storage.');
    return createInMemoryStorage();
  }
})();

export const safeSessionStorage: Storage = (() => {
  try {
    const test = window.sessionStorage;
    test.getItem('__test_sandbox__');
    return window.sessionStorage;
  } catch (e) {
    console.warn('[Sandbox] SessionStorage is blocked or inaccessible. Fallback to in-memory storage.');
    return createInMemoryStorage();
  }
})();
