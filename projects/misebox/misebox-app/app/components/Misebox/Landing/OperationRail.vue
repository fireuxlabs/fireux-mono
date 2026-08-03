<template>
  <nav class="misebox-operation-rail" aria-label="Kitchen operations">
    <div class="misebox-operation-rail__track">
      <NuxtLink
        v-for="operation in kitchenOperations"
        :key="operation.id"
        :to="operation.slug ? `/operations/${operation.slug}` : operation.to"
        class="misebox-operation-rail__operation"
      >
        <UIcon :name="operation.icon || 'i-lucide-circle'" aria-hidden="true" />
        {{ operation.title }}
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FireuxMetaOperation } from 'fireux-core/runtime/models/system/meta-content.model'

const props = defineProps<{
  operations: readonly FireuxMetaOperation[]
}>()

const kitchenOperations = computed(() =>
  props.operations.filter((operation) => operation.console.id === 'kitchen')
)
</script>

<style scoped>
.misebox-operation-rail {
  display: flex;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  border-block: 1px solid var(--ui-border);
}

.misebox-operation-rail__operation {
  display: inline-flex;
  flex: 0 0 auto;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  color: var(--ui-text-toned);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}

.misebox-operation-rail__track {
  display: flex;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
}

.misebox-operation-rail__track::-webkit-scrollbar {
  display: none;
}

.misebox-operation-rail__operation:hover {
  color: var(--ui-text-highlighted);
}

.misebox-operation-rail__operation svg {
  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);
  color: var(--ui-primary);
}
</style>
