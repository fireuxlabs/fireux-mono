<template>
  <UPageHeader
    :title="title"
    :description="description"
    class="workspace-page-header"
    :class="`workspace-page-header--${variant}`"
  >
    <template v-if="$slots.actions" #links>
      <slot name="actions" />
    </template>
  </UPageHeader>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    variant?: 'primary' | 'child'
  }>(),
  { title: undefined, description: undefined, variant: 'primary' }
)
</script>

<style scoped>
.workspace-page-header {
  padding-block: 0;
  border: 0;
  min-width: 0;
}

.workspace-page-header :deep([data-slot='title']) {
  font-size: var(--text-3xl);
  line-height: var(--text-3xl--line-height);
  overflow-wrap: anywhere;
}

.workspace-page-header--child :deep([data-slot='title']) {
  font-size: var(--text-2xl);
  line-height: var(--text-2xl--line-height);
}

.workspace-page-header :deep([data-slot='description']) {
  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);
  color: var(--ui-text-muted);
  overflow-wrap: anywhere;
}
</style>
