<script setup lang="ts">
import { computed } from "vue";
import { useConnexioStore } from "~/stores/connexio";

const connexio = useConnexioStore();

const colorClass = computed(() =>
  connexio.estat === "connectat" ? "bg-green-500" : "bg-red-500",
);

const text = computed(() => {
  if (connexio.estat === "connectat") return "Connectat";
  if (connexio.estat === "reconnectant") return "Reconnectant…";
  return "Desconnectat";
});
</script>

<template>
  <div class="flex items-center gap-2">
    <span :class="[colorClass, 'rounded-full w-2 h-2 inline-block']" />
    <span
      class="text-xs font-medium"
      :class="connexio.estat === 'connectat' ? 'text-green-400' : 'text-red-400'"
    >{{ text }}</span>
  </div>
</template>
