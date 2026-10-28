<template>
  <header class="kitchen-collection-header">
    <h1 class="kitchen-collection-header__title">{{ title }}</h1>
    <div v-if="$slots.actions" class="kitchen-collection-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style scoped>
.kitchen-collection-header,
.kitchen-collection-header__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 4);
}
.kitchen-collection-header {
  min-width: 0;
  justify-content: space-between;
}
.kitchen-collection-header__actions {
  gap: calc(var(--spacing) * 2);
}
.kitchen-collection-header__title {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-3xl);
  line-height: var(--text-3xl--line-height);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tight);
}
</style>
