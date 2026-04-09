<script setup lang="ts">
defineProps<{
  missatge: string;
  tipus?: "info" | "error";
}>();
</script>

<template>
  <div
    class="notificacio"
    :class="`notificacio--${tipus ?? 'info'}`"
    role="status"
  >
    {{ missatge }}
  </div>
</template>

<style scoped>
.notificacio {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  display: inline-block;
}

.notificacio--info {
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.notificacio--error {
  background-color: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}
</style>
