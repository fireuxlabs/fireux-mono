<template>
  <div class="collection-directory-state">
    <UIcon :name="icon" :class="{ 'animate-spin': loading }" />
    <div>
      <h3 v-if="title">{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CollectionDirectoryState' })

withDefaults(defineProps<{
  description: string
  icon?: string
  loading?: boolean
  title?: string
}>(), {
  icon: 'i-lucide-inbox',
  loading: false,
  title: '',
})
</script>

<style scoped>
.collection-directory-state {
  align-items: center;
  background: color-mix(in srgb, var(--ui-primary) 3%, var(--ui-bg));
  border: 1px dashed color-mix(in srgb, var(--ui-primary) 28%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 6);
  color: var(--ui-text-muted);
  display: flex;
  gap: calc(var(--spacing) * 4);
  justify-content: center;
  min-height: calc(var(--spacing) * 52);
  padding: calc(var(--spacing) * 8);
  text-align: left;
}

.collection-directory-state > svg {
  color: var(--ui-primary);
  flex: 0 0 auto;
  height: calc(var(--spacing) * 6);
  width: calc(var(--spacing) * 6);
}

.collection-directory-state h3,
.collection-directory-state p {
  margin: 0;
}

.collection-directory-state h3 {
  color: var(--ui-text-highlighted);
  font-weight: var(--font-weight-semibold);
}

.collection-directory-state p {
  font-size: var(--text-sm);
  margin-top: var(--spacing);
}
</style>
