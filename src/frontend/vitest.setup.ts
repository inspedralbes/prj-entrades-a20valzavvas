// Provide a functional localStorage implementation for the happy-dom test environment
const _store: Record<string, string> = {};

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string): string | null => _store[key] ?? null,
    setItem: (key: string, value: string) => {
      _store[key] = value;
    },
    removeItem: (key: string) => {
      delete _store[key];
    },
    clear: () => {
      Object.keys(_store).forEach((k) => delete _store[k]);
    },
    get length() {
      return Object.keys(_store).length;
    },
    key: (index: number): string | null => Object.keys(_store)[index] ?? null,
  },
  writable: true,
  configurable: true,
});
