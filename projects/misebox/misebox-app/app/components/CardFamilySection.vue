<template>
  <section
    v-if="visible"
    class="misebox-card-family"
    :data-active-variant="variant"
    :aria-labelledby="id"
  >
    <header class="misebox-card-family__header">
      <div class="misebox-card-family__identity">
        <span class="misebox-card-family__icon" aria-hidden="true">
          <UIcon :name="icon" />
        </span>
        <div>
          <h2 :id="id">{{ title }}</h2>
          <p>{{ source }}</p>
        </div>
      </div>

      <UBadge color="neutral" variant="outline" size="sm">
        {{ variants.length }} {{ variants.length === 1 ? 'variant' : 'variants' }}
      </UBadge>
    </header>

    <div class="misebox-card-family__grid">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  id: string
  icon: string
  title: string
  source: string
  query: string
  variant: 'all' | 'cell' | 'pill' | 'preview'
  variants: Array<'cell' | 'pill' | 'preview'>
}>()

const visible = computed(() => {
  const query = props.query.trim().toLocaleLowerCase()
  const matchesQuery = !query
    || `${props.title} ${props.source}`.toLocaleLowerCase().includes(query)
  const matchesVariant = props.variant === 'all'
    || props.variants.includes(props.variant)

  return matchesQuery && matchesVariant
})
</script>

<style scoped>
.misebox-card-family {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 4);
  padding-block: calc(var(--spacing) * 7);
  border-top: 1px solid var(--ui-border);
}

.misebox-card-family__header,
.misebox-card-family__identity {
  display: flex;
  min-width: 0;
  align-items: center;
}

.misebox-card-family__header {
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
}

.misebox-card-family__identity {
  gap: calc(var(--spacing) * 3);
}

.misebox-card-family__icon {
  display: grid;
  width: calc(var(--spacing) * 10);
  height: calc(var(--spacing) * 10);
  flex: none;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg-elevated);
  color: var(--ui-primary);
}

.misebox-card-family h2,
.misebox-card-family p {
  margin: 0;
}

.misebox-card-family h2 {
  color: var(--ui-text-highlighted);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
}

.misebox-card-family p {
  margin-top: var(--spacing);
  color: var(--ui-text-dimmed);
  font-size: var(--text-xs);
}

.misebox-card-family__grid {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--spacing) * 4);
}

.misebox-card-family[data-active-variant='cell']
  :deep(.misebox-card-specimen:not([data-card-variant='cell'])),
.misebox-card-family[data-active-variant='pill']
  :deep(.misebox-card-specimen:not([data-card-variant='pill'])),
.misebox-card-family[data-active-variant='preview']
  :deep(.misebox-card-specimen:not([data-card-variant='preview'])) {
  display: none;
}

@media (min-width: 64rem) {
  .misebox-card-family__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
