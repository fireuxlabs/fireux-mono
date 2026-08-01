<template>
  <header
    class="collection-directory-header"
    :class="{ 'collection-directory-header--compact': compact }"
  >
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
  compact?: boolean
  description?: string
  eyebrow?: string
  title: string
}>(), {
  compact: false,
  description: '',
  eyebrow: 'Browse',
})
</script>

<style scoped>
.collection-directory-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
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
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: calc(var(--spacing) * 2);
  min-height: calc(var(--spacing) * 10);
}

.collection-directory-header--compact .collection-directory-header__title h2 {
  font-size: clamp(var(--text-2xl), 4vw, var(--text-4xl));
}

@media (min-width: 40rem) {
  .collection-directory-header {
    align-items: end;
  }

  .collection-directory-header__controls {
    width: auto;
    align-items: center;
  }
}
</style>
