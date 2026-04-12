<script setup lang="ts">
const estats = [
  { label: "Disponible", color: "#15803d" },
  { label: "Reservat", color: "#b45309" },
  { label: "Seleccionat per mi", color: "#7c3aed" },
  { label: "Venut", color: "#2d3748", border: "#4b5563" },
];
</script>

<template>
  <div class="llegenda">
    <div v-for="estat in estats" :key="estat.label" class="llegenda-item">
      <span
        class="llegenda-dot"
        :style="{
          backgroundColor: estat.color,
          boxShadow: estat.border ? `inset 0 0 0 1px ${estat.border}` : 'none',
        }"
      />
      <span class="llegenda-text">{{ estat.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.llegenda {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem 1.25rem;
  padding: 0 0 1.25rem;
}

.llegenda-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: #64748b;
}

.llegenda-dot {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 3px 3px 1px 1px;
  display: inline-block;
  flex-shrink: 0;
}
</style>
