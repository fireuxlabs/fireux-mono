<template>
  <header class="collection-directory-header">
    <div class="collection-directory-header__title">
      <p>{{ eyebrow }}</p>
      <h2>{{ title }}</h2>
      <span v-if="description">{{ description }}</span>
    </div>

    <div v-if="$slots.controls" class="collection-directory-header__controls">
      <slot name="controls" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({ name: 'CollectionDirectoryHeader' })

withDefaults(defineProps<{
  description?: string
  eyebrow?: string
  title: string
}>(), {
  description: '',
  eyebrow: 'Browse',
})
</script>

<style scoped>
.collection-directory-header {
  align-items: end;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 6) calc(var(--spacing) * 12);
  justify-content: space-between;
}

.collection-directory-header__title {
  max-width: calc(var(--spacing) * 160);
}

.collection-directory-header__title p {
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-widest);
  margin: 0 0 calc(var(--spacing) * 2);
  text-transform: uppercase;
}

.collection-directory-header__title h2 {
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-3xl), 5vw, var(--text-6xl));
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tighter);
  line-height: 1;
  margin: 0;
}

.collection-directory-header__title span {
  color: var(--ui-text-muted);
  display: block;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  margin-top: calc(var(--spacing) * 4);
}

.collection-directory-header__controls {
  align-items: center;
  display: flex;
  gap: calc(var(--spacing) * 2);
  min-height: calc(var(--spacing) * 10);
}

@media (max-width: 40rem) {
  .collection-directory-header,
  .collection-directory-header__controls {
    align-items: flex-start;
  }

  .collection-directory-header__controls {
    width: 100%;
  }
}
</style>
