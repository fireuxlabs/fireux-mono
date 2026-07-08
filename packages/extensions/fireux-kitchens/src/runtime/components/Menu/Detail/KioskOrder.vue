<template>
  <section v-if="view" class="kiosk-order" aria-label="Kiosk menu">
    <nav class="kiosk-order__sections" aria-label="Menu sections">
      <button
        v-for="section in sections"
        :key="section.id"
        type="button"
        class="kiosk-order__section"
        :class="{ 'kiosk-order__section--active': section.id === activeSectionId }"
        @click="activeSectionId = section.id"
      >
        {{ section.label }}
      </button>
    </nav>

    <div class="kiosk-order__items">
      <header class="kiosk-order__header">
        <p>{{ modeLabel }}</p>
        <h1>{{ activeSection?.label || view.menu.content.name }}</h1>
      </header>

      <div class="kiosk-order__grid">
        <article
          v-for="item in activeItems"
          :key="item.id"
          class="kiosk-order__item"
        >
          <button
            type="button"
            class="kiosk-order__item-main"
            @click="$emit('selectItem', item)"
          >
            <span v-if="item.imageUrl" class="kiosk-order__media">
              <img :src="item.imageUrl" :alt="item.name" loading="lazy">
            </span>
            <span v-else class="kiosk-order__media kiosk-order__media--empty">
              {{ item.name.slice(0, 1) }}
            </span>

            <span class="kiosk-order__copy">
              <strong>{{ item.name }}</strong>
              <small v-if="item.description">{{ item.description }}</small>
            </span>
          </button>

          <div class="kiosk-order__item-action">
            <span>{{ item.priceLabel }}</span>
            <button type="button" @click="$emit('add', orderItem(item))">
              <UIcon name="i-lucide-plus" aria-hidden="true" />
            </button>
          </div>
        </article>
      </div>

      <MenuDetailKioskBasket :basket="basket" @open="$emit('openBasket')" />
    </div>
  </section>

  <p v-else class="kiosk-order__empty">Menu unavailable.</p>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  MenuDetailItem,
  MenuDetailOrderItem,
  MenuDetailView,
} from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type { MenuFoodSection } from '../../../models/kitchen/menu/menu-food.model'
import type { MenuOrderingFunnelState } from '../../../models/kitchen/menu/menu-ordering.model'

const props = defineProps<{
  basket?: MenuOrderingFunnelState | null
  mode?: 'eat_in' | 'takeaway' | ''
  view: MenuDetailView | null
}>()

defineEmits<{
  (event: 'openBasket'): void
  (event: 'selectItem', item: MenuDetailItem): void
  (event: 'add', item: MenuDetailOrderItem): void
}>()

const activeSectionId = ref('')
const sections = computed<MenuFoodSection[]>(() =>
  props.view?.menu.content.sections ?? []
)
const activeSection = computed(() =>
  sections.value.find((section) => section.id === activeSectionId.value) ||
    sections.value[0] ||
    null
)
const activeItems = computed(() => activeSection.value?.items ?? [])
const modeLabel = computed(() =>
  props.mode === 'eat_in'
    ? 'Eat in'
    : props.mode === 'takeaway'
      ? 'Takeaway'
      : 'Kiosk'
)

function orderItem(item: MenuDetailItem): MenuDetailOrderItem {
  return {
    ...item,
    lineId: item.id,
  }
}

watch(sections, (nextSections) => {
  if (nextSections.some((section) => section.id === activeSectionId.value)) return

  activeSectionId.value = nextSections[0]?.id || ''
}, { immediate: true })
</script>

<style scoped>
.kiosk-order {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(12rem, 18rem) minmax(0, 1fr);
  gap: clamp(1rem, 2vw, 1.75rem);
  height: calc(100svh - 7.5rem);
  padding: clamp(1rem, 2vw, 2rem);
}

.kiosk-order__sections,
.kiosk-order__items {
  min-height: 0;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 1.5rem;
  background: color-mix(in srgb, var(--kiosk-secondary) 42%, transparent);
  box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 24%);
}

.kiosk-order__sections {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  overflow: auto;
  padding: 0.85rem;
}

.kiosk-order__section {
  min-height: 4.5rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--kiosk-secondary) 28%, transparent);
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: 1rem;
  font-weight: 900;
  text-align: left;
}

.kiosk-order__section--active {
  border-color: color-mix(in srgb, var(--kiosk-primary) 76%, white);
  background: color-mix(in srgb, var(--kiosk-primary) 20%, transparent);
}

.kiosk-order__items {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
}

.kiosk-order__header {
  padding: clamp(1rem, 2vw, 1.5rem);
}

.kiosk-order__header p,
.kiosk-order__header h1 {
  margin: 0;
}

.kiosk-order__header p {
  color: color-mix(in srgb, white 72%, transparent);
  font-size: 0.95rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.kiosk-order__header h1 {
  color: white;
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: 950;
}

.kiosk-order__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(0.9rem, 1.8vw, 1.25rem);
  overflow: auto;
  padding: 0 clamp(1rem, 2vw, 1.5rem) clamp(1rem, 2vw, 1.5rem);
}

.kiosk-order__item {
  display: grid;
  min-height: 18rem;
  grid-template-rows: minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 1.25rem;
  background: rgb(255 255 255 / 88%);
  color: #111;
}

.kiosk-order__item-main {
  display: grid;
  grid-template-rows: 9rem minmax(0, 1fr);
  gap: 0.9rem;
  padding: 1rem;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  text-align: left;
}

.kiosk-order__media {
  display: grid;
  overflow: hidden;
  border-radius: 1rem;
  background: #f3f4f6;
  place-items: center;
}

.kiosk-order__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kiosk-order__media--empty {
  color: color-mix(in srgb, var(--kiosk-primary) 70%, black);
  font-size: 4rem;
  font-weight: 950;
}

.kiosk-order__copy {
  display: grid;
  gap: 0.35rem;
}

.kiosk-order__copy strong {
  font-size: clamp(1.25rem, 2vw, 1.8rem);
  font-weight: 950;
  line-height: 1.05;
}

.kiosk-order__copy small {
  color: #374151;
  font-size: 0.95rem;
  line-height: 1.3;
}

.kiosk-order__item-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.kiosk-order__item-action span {
  font-size: 1.4rem;
  font-weight: 950;
}

.kiosk-order__item-action button {
  display: grid;
  width: 3.25rem;
  height: 3.25rem;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: var(--kiosk-primary);
  color: white;
  cursor: pointer;
}

.kiosk-order__item-action :deep(.iconify) {
  width: 1.75rem;
  height: 1.75rem;
}

.kiosk-order__empty {
  position: relative;
  z-index: 1;
  margin: 0;
  color: white;
  font-size: 2rem;
  font-weight: 900;
}

@media (max-width: 820px) {
  .kiosk-order {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .kiosk-order__sections {
    flex-direction: row;
  }

  .kiosk-order__section {
    min-width: 10rem;
  }
}
</style>
