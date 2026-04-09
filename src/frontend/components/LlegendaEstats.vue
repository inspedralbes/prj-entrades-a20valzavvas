<script setup lang="ts">
const estats = [
  { label: "Disponible", classe: "estat--disponible", color: "#16A34A" },
  { label: "Reservat", classe: "estat--reservat", color: "#D97706" },
  {
    label: "Seleccionat per mi",
    classe: "estat--seleccionat-per-mi",
    color: "#7C3AED",
  },
  { label: "Venut", classe: "estat--venut", color: "#374151" },
];
</script>

<template>
  <div class="llegenda">
    <div v-for="estat in estats" :key="estat.label" class="llegenda-item">
      <span class="llegenda-color" :style="{ backgroundColor: estat.color }" />
      <span class="llegenda-text">{{ estat.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.llegenda {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.75rem 1rem;
}

.llegenda-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: #374151;
}

.llegenda-color {
  width: 1rem;
  height: 1rem;
  border-radius: 3px;
  display: inline-block;
  flex-shrink: 0;
}
</style>
