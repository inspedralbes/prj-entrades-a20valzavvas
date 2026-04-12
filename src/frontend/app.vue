<template>
  <div class="app-shell">
    <AppNavbar />
    <main class="app-main">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
.app-shell {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
