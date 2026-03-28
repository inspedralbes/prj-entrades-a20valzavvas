import { defineStore } from "pinia";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: null,
    user: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },

  actions: {
    async login(credentials: { email: string; password: string }) {
      const data = await $fetch<{ token: string; user: AuthUser }>(
        "/api/auth/login",
        {
          method: "POST",
          body: credentials,
        },
      );
      this.token = data.token;
      this.user = data.user;
      if (import.meta.client) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
    },

    async register(payload: { name: string; email: string; password: string }) {
      await $fetch("/api/auth/register", {
        method: "POST",
        body: payload,
      });
      await this.login({ email: payload.email, password: payload.password });
    },

    logout() {
      this.token = null;
      this.user = null;
      if (import.meta.client) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    },

    initFromStorage() {
      if (!import.meta.client) return;
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken) {
        this.token = storedToken;
        this.user = storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
      }
    },
  },
});
