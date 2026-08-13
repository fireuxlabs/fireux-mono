<template>
  <div class="font">
    <small>{{ label }}</small>
    <span v-if="value" class="font__sample" :style="{ fontFamily: value }">Aa</span>
    <code v-if="value">{{ value }}</code>
    <strong v-else>Missing</strong>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value?: string }>()
</script>

<style scoped>
.font { display: grid; grid-template-columns: auto 1fr; gap: calc(var(--spacing) * 1) calc(var(--spacing) * 3); align-items: center; }
.font small { color: var(--ui-text-muted); }
.font__sample { grid-row: span 2; font-size: var(--text-4xl); line-height: 1; }
.font code { overflow-wrap: anywhere; font-size: var(--text-xs); }
.font strong { color: var(--ui-text-muted); font-size: var(--text-sm); }
</style>
