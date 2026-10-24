<template>
  <section class="landing-surface-showcase" :aria-labelledby="`${sectionId}-title`">
    <div
      v-if="items.length > 1"
      class="landing-surface-showcase__selector"
      role="group"
      :aria-label="selectorLabel"
    >
      <button
        v-for="surface in items"
        :key="surface.id"
        type="button"
        :aria-pressed="selected.id === surface.id"
        @click="selectedId = surface.id"
      >
        <UIcon :name="surface.icon" aria-hidden="true" />
        <span>{{ surface.title }}</span>
      </button>
    </div>

    <LandingProductProofSection
      :section-id="sectionId"
      :eyebrow="items.length > 1 ? 'Ways to use the App' : undefined"
      :title="selected.title"
      :description="selected.description"
      :supporting="selected.supporting"
      :items="selected.items"
      :action="{
        label: selected.action,
        to: selected.to,
        icon: 'i-lucide-arrow-right',
      }"
    >
      <slot name="preview" :surface="selected">
        <div class="landing-surface-showcase__preview" data-landing-reveal="scale">
          <UIcon :name="selected.icon" aria-hidden="true" />
          <p>{{ selected.title }}</p>
          <span>{{ selected.description }}</span>
        </div>
      </slot>
    </LandingProductProofSection>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LandingProductSurface } from './product.types'

const props = withDefaults(defineProps<{
  items: readonly LandingProductSurface[]
  sectionId?: string
  selectorLabel?: string
}>(), {
  sectionId: 'product-surfaces',
  selectorLabel: 'Choose a product surface',
})

const selectedId = ref(props.items[0]?.id || '')
const selected = computed(() =>
  props.items.find(surface => surface.id === selectedId.value) || props.items[0]!
)
</script>

<style scoped>
.landing-surface-showcase {
  min-width: 0;
}

.landing-surface-showcase__selector {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  padding-block: calc(var(--spacing) * 8) 0;
}

.landing-surface-showcase__selector button {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  background: var(--ui-bg);
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
}

.landing-surface-showcase__selector button[aria-pressed='true'] {
  border-color: var(--ui-primary);
  background: var(--ui-primary-50);
  color: var(--ui-primary);
}

.landing-surface-showcase__preview {
  display: grid;
  min-height: 22rem;
  place-content: center;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 10);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg-muted);
  text-align: center;
}

.landing-surface-showcase__preview svg {
  width: 4rem;
  height: 4rem;
  margin-inline: auto;
  color: var(--ui-primary);
}

.landing-surface-showcase__preview p {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
}

.landing-surface-showcase__preview span {
  max-width: 32rem;
  color: var(--ui-text-muted);
}
</style>
