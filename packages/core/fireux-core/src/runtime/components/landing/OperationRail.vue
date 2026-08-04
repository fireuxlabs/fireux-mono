<template>
  <nav class="landing-operation-rail" :aria-label="ariaLabel">
    <div class="landing-operation-rail__track">
      <NuxtLink
        v-for="operation in operations"
        :key="operation.id"
        :to="operation.to"
        class="landing-operation-rail__operation"
      >
        <UIcon :name="operation.icon || 'i-lucide-circle'" aria-hidden="true" />
        {{ operation.title }}
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { LandingOperationRailItem } from '../../../types/landing-product'

defineProps<{
  ariaLabel: string
  operations: readonly LandingOperationRailItem[]
}>()
</script>

<style scoped>
.landing-operation-rail {
  position: sticky;
  z-index: 30;
  top: var(--ui-header-height, 4rem);
  box-sizing: border-box;
  display: flex;
  width: 100dvw;
  min-width: 0;
  margin-inline: calc(50% - 50dvw);
  align-items: center;
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  border-block: 1px solid var(--ui-border);
  background: color-mix(in srgb, var(--ui-bg) 94%, transparent);
  backdrop-filter: blur(calc(var(--spacing) * 3));
}

.landing-operation-rail__track {
  display: flex;
  width: 100%;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  justify-content: safe center;
  overflow-x: auto;
  scrollbar-width: none;
}

.landing-operation-rail__track::-webkit-scrollbar {
  display: none;
}

.landing-operation-rail__operation {
  display: inline-flex;
  flex: 0 0 auto;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  color: var(--ui-text-toned);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

.landing-operation-rail__operation:hover {
  color: var(--ui-text-highlighted);
}

.landing-operation-rail__operation svg {
  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);
  color: var(--ui-primary);
}
</style>
