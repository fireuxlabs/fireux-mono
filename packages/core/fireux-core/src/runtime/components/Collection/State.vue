<template>
  <div class="collection-state">
    <div class="collection-state__message">
      <span class="collection-state__icon">
        <UIcon :name="icon" :class="{ 'animate-spin': loading }" />
      </span>
      <div>
        <h3 v-if="title">{{ title }}</h3>
        <p>{{ description }}</p>
      </div>
    </div>

    <div v-if="$slots.actions" class="collection-state__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CollectionState' })

withDefaults(
  defineProps<{
    description: string
    icon?: string
    loading?: boolean
    title?: string
  }>(),
  {
    icon: 'i-lucide-inbox',
    loading: false,
    title: '',
  }
)
</script>

<style scoped>
.collection-state {
  background: color-mix(in srgb, var(--ui-primary) 3%, var(--ui-bg));
  border: 1px dashed color-mix(in srgb, var(--ui-primary) 28%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 6);
  color: var(--ui-text-muted);
  display: grid;
  gap: calc(var(--spacing) * 6);
  justify-items: center;
  min-height: calc(var(--spacing) * 52);
  padding: calc(var(--spacing) * 8);
  place-content: center;
  text-align: center;
}

.collection-state__message {
  align-items: center;
  display: flex;
  gap: calc(var(--spacing) * 4);
  text-align: left;
}

.collection-state__icon {
  align-items: center;
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 18%, transparent);
  border-radius: 9999px;
  display: flex;
  flex: 0 0 auto;
  height: calc(var(--spacing) * 12);
  justify-content: center;
  width: calc(var(--spacing) * 12);
}

.collection-state__icon > svg {
  color: var(--ui-primary);
  height: calc(var(--spacing) * 6);
  width: calc(var(--spacing) * 6);
}

.collection-state h3,
.collection-state p {
  margin: 0;
}

.collection-state h3 {
  color: var(--ui-text-highlighted);
  font-weight: var(--font-weight-semibold);
}

.collection-state p {
  font-size: var(--text-sm);
  margin-top: var(--spacing);
}

.collection-state__actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
  justify-content: center;
}

@media (max-width: 30rem) {
  .collection-state__message {
    flex-direction: column;
    text-align: center;
  }
}
</style>
