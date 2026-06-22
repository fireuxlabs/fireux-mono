<template>
  <div :class="['manifest-sections', { 'manifest-sections--order': orderMode }]">
    <section
      v-for="section in sections"
      :key="section.id"
      :id="sectionDomId(section.id)"
      class="manifest-section"
    >
      <h2>{{ section.label }}</h2>

      <article
        v-for="item in section.items"
        :key="item.id"
        class="manifest-item"
      >
        <div class="manifest-item__copy">
          <h3>{{ item.name }}</h3>
          <p v-if="item.description">
            {{ item.description }}
          </p>
        </div>

        <div
          v-if="item.priceLabel || orderMode"
          class="manifest-item__actions"
        >
          <p v-if="item.priceLabel" class="manifest-item__price">
            {{ item.priceLabel }}
          </p>

          <div v-if="orderMode" class="manifest-quantity">
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-lucide-minus"
              :disabled="quantity(item.id) === 0"
              :aria-label="`Remove ${item.name}`"
              @click="$emit('remove', item)"
            />
            <span>{{ quantity(item.id) }}</span>
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-lucide-plus"
              :aria-label="`Add ${item.name}`"
              @click="$emit('add', item)"
            />
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
type MenuManifestItem = {
  id: string
  name: string
  description?: string
  priceLabel?: string
}

type MenuManifestSection = {
  id: string
  label: string
  items: MenuManifestItem[]
}

const props = defineProps<{
  sections: MenuManifestSection[]
  orderMode?: boolean
  quantities?: Record<string, number>
}>()

defineEmits<{
  (event: 'add', item: MenuManifestItem): void
  (event: 'remove', item: MenuManifestItem): void
}>()

const sectionDomId = (id: string) =>
  `menu-section-${String(id || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`
const quantity = (id: string) => props.quantities?.[id] || 0
</script>

<style scoped>
.manifest-sections {
  display: grid;
  gap: 2rem;
  width: min(88rem, 100%);
  margin: 0 auto;
  text-align: left;
}

.manifest-section {
  display: grid;
  gap: 0.7rem;
  align-content: start;
}

.manifest-section h2 {
  display: grid;
  grid-template-columns: auto minmax(2rem, 1fr);
  gap: 0.75rem;
  align-items: center;
  margin: 0;
  color: var(--menu-title);
  font-size: clamp(1.05rem, 1.6vw, 1.25rem);
  font-weight: 900;
  letter-spacing: 0.18em;
  line-height: 1.2;
  text-transform: uppercase;
}

.manifest-section h2::after {
  content: "";
  display: block;
  height: 2px;
  background: color-mix(in srgb, var(--menu-title) 38%, transparent);
}

.manifest-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  padding-bottom: 0.7rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
}

.manifest-sections--order {
  gap: 1rem;
}

.manifest-sections--order .manifest-section {
  gap: 0.45rem;
}

.manifest-sections--order .manifest-section h2 {
  font-size: clamp(0.9rem, 1.2vw, 1.05rem);
  letter-spacing: 0.14em;
}

.manifest-sections--order .manifest-item {
  gap: 0.75rem;
  padding-bottom: 0.45rem;
}

.manifest-item:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.manifest-item__copy,
.manifest-item__actions {
  display: grid;
}

.manifest-item__copy {
  gap: 0.2rem;
}

.manifest-item__actions {
  gap: 0.45rem;
  justify-items: end;
}

.manifest-item h3,
.manifest-item p {
  margin: 0;
}

.manifest-item h3 {
  font-size: 1.1rem;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.manifest-item__copy p {
  color: var(--menu-muted);
  font-size: 0.9rem;
  line-height: 1.35;
}

.manifest-item__price {
  font-size: 0.95rem;
  font-weight: 850;
  white-space: nowrap;
}

.manifest-quantity {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
}

.manifest-quantity span {
  min-width: 1.5rem;
  color: var(--menu-title);
  font-size: 0.9rem;
  font-weight: 900;
  text-align: center;
}

@media (min-width: 920px) {
  .manifest-sections {
    display: block;
    column-count: 2;
    column-gap: clamp(2rem, 4vw, 4rem);
  }

  .manifest-section {
    break-inside: avoid;
    margin-bottom: 2rem;
  }

  .manifest-sections--order {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: clamp(1.25rem, 2.5vw, 2rem);
    row-gap: 1.25rem;
  }

  .manifest-sections--order .manifest-section {
    margin-bottom: 0;
  }
}
</style>
