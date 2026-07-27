<template>
  <div class="misebox-specimen-heading">
    <h2 :id="id">{{ title }}</h2>
    <code>{{ source }}</code>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  title: string
  source: string
}>()
</script>

<style scoped>
.misebox-specimen-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 3);
  border-bottom: 1px solid var(--ui-border);
}

.misebox-specimen-heading h2 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
}

.misebox-specimen-heading code {
  color: var(--ui-text-dimmed);
  font-size: var(--text-xs);
}
</style>
