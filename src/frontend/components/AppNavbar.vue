<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const authStore = useAuthStore();

const isAdmin = computed(() => authStore.user?.role === "admin");

async function logout() {
  authStore.logout();
  await navigateTo("/auth/login");
}
</script>

<template>
  <nav class="app-navbar">
    <div class="navbar-inner">
      <NuxtLink
        to="/"
        class="navbar-logo"
        exact-active-class="navbar-logo--active"
      >
        SALA ONIRICA
      </NuxtLink>

      <div class="navbar-links">
        <NuxtLink
          to="/"
          class="navbar-link"
          exact-active-class="navbar-link--active"
        >
          Events
        </NuxtLink>

        <template v-if="authStore.isAuthenticated">
          <NuxtLink
            v-if="!isAdmin"
            to="/entrades"
            class="navbar-link"
            active-class="navbar-link--active"
          >
            Entrades
          </NuxtLink>

          <NuxtLink
            v-if="isAdmin"
            to="/admin"
            class="navbar-link"
            exact-active-class="navbar-link--active"
          >
            Dashboard
          </NuxtLink>

          <NuxtLink
            v-if="isAdmin"
            to="/admin/events"
            class="navbar-link"
            active-class="navbar-link--active"
          >
            Panel Admin
          </NuxtLink>

          <span class="navbar-greeting">Hola, {{ authStore.user?.name }}</span>

          <button class="navbar-logout" type="button" @click="logout">
            Tancar sessió
          </button>
        </template>

        <template v-else>
          <NuxtLink
            to="/auth/login"
            class="navbar-link"
            active-class="navbar-link--active"
          >
            Iniciar sessió
          </NuxtLink>
          <NuxtLink
            to="/auth/register"
            class="navbar-link navbar-link--cta"
            active-class="navbar-link--active"
          >
            Registrar-se
          </NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  background: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.navbar-logo {
  font-family: var(--font-family-mono, monospace);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.1em;
  color: var(--color-text-primary);
  text-decoration: none;
  transition: color 0.15s ease;
}

.navbar-logo:hover,
.navbar-logo--active {
  color: var(--color-accent-primary);
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar-link {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.15s ease;
  padding: 0.25rem 0;
}

.navbar-link:hover,
.navbar-link--active {
  color: var(--color-accent-primary);
}

.navbar-link--cta {
  padding: 0.375rem 0.75rem;
  background: var(--color-accent-primary);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
}

.navbar-link--cta:hover {
  background: var(--color-accent-primary-hover);
  color: var(--color-text-primary);
}

.navbar-greeting {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.navbar-logout {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  font-family: var(--font-family-base);
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.navbar-logout:hover {
  color: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
}
</style>
