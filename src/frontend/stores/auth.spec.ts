import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./auth";

// Mock $fetch (Nuxt global)
const mockFetch = vi.fn();
vi.stubGlobal("$fetch", mockFetch);

const mockUser = {
  id: "uuid-1",
  name: "Test User",
  email: "user@example.com",
  role: "comprador",
};

describe("useAuthStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    mockFetch.mockReset();
  });

  describe("login", () => {
    it("desa el token i actualitza isAuthenticated", async () => {
      mockFetch.mockResolvedValueOnce({ token: "tok-123", user: mockUser });
      const store = useAuthStore();

      await store.login({ email: "user@example.com", password: "pass" });

      expect(store.token).toBe("tok-123");
      expect(store.isAuthenticated).toBe(true);
      expect(store.user).toEqual(mockUser);
      expect(localStorage.getItem("auth_token")).toBe("tok-123");
      expect(JSON.parse(localStorage.getItem("auth_user")!)).toEqual(mockUser);
    });

    it("crida POST /api/auth/login amb les credencials", async () => {
      mockFetch.mockResolvedValueOnce({ token: "tok-abc", user: mockUser });
      const store = useAuthStore();

      await store.login({ email: "a@b.com", password: "secret" });

      expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
        method: "POST",
        body: { email: "a@b.com", password: "secret" },
      });
    });
  });

  describe("logout", () => {
    it("neteja l'estat i elimina el token de localStorage", async () => {
      mockFetch.mockResolvedValueOnce({ token: "tok-123", user: mockUser });
      const store = useAuthStore();
      await store.login({ email: "user@example.com", password: "pass" });

      store.logout();

      expect(store.token).toBeNull();
      expect(store.user).toBeNull();
      expect(store.isAuthenticated).toBe(false);
      expect(localStorage.getItem("auth_token")).toBeNull();
      expect(localStorage.getItem("auth_user")).toBeNull();
    });
  });

  describe("initFromStorage", () => {
    it("rehidrata el token i l'usuari si existeixen a localStorage", () => {
      localStorage.setItem("auth_token", "stored-tok");
      localStorage.setItem("auth_user", JSON.stringify(mockUser));
      const store = useAuthStore();

      store.initFromStorage();

      expect(store.token).toBe("stored-tok");
      expect(store.isAuthenticated).toBe(true);
      expect(store.user).toEqual(mockUser);
    });

    it("no modifica l'estat si no hi ha token", () => {
      const store = useAuthStore();

      store.initFromStorage();

      expect(store.token).toBeNull();
      expect(store.isAuthenticated).toBe(false);
    });
  });

  describe("register", () => {
    it("registra i fa login automàtic", async () => {
      mockFetch
        .mockResolvedValueOnce(undefined) // register
        .mockResolvedValueOnce({ token: "tok-new", user: mockUser }); // login
      const store = useAuthStore();

      await store.register({
        name: "Test",
        email: "user@example.com",
        password: "pass",
        password_confirmation: "pass",
      });

      expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/auth/register", {
        method: "POST",
        body: {
          name: "Test",
          email: "user@example.com",
          password: "pass",
          password_confirmation: "pass",
        },
      });
      expect(store.isAuthenticated).toBe(true);
      expect(store.token).toBe("tok-new");
    });
  });
});
