<template>
  <section v-if="view" class="kiosk-browse" aria-label="Kiosk browse">
    <aside class="kiosk-browse__menu" aria-label="Menu sections">
      <div class="kiosk-browse__sections" aria-label="Sections">
        <button
          v-for="section in activeSections"
          :key="section.id"
          type="button"
          class="kiosk-browse__section"
          :class="{
            'kiosk-browse__section--active': section.id === activeSectionId,
          }"
          @click="activeSectionId = section.id"
        >
          {{ section.label }}
        </button>
      </div>
    </aside>

    <main class="kiosk-browse__content" aria-label="Dishes">
      <section v-if="activeSection" class="kiosk-browse__dish-section">
        <header class="kiosk-browse__content-header">
          <h2>
            {{ activeSection.label }}
          </h2>
        </header>

        <div class="kiosk-browse__dishes">
          <MenuDetailKioskItem
            v-for="item in activeSection.items"
            :key="item.id"
            :item="item"
            @add="emit('add', $event)"
          />
        </div>
      </section>
    </main>
  </section>

  <p v-else class="kiosk-browse__empty">Menu unavailable.</p>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  MenuDetailOrderItem,
  MenuDetailView,
} from '../../../../kitchen/composables/order/funnel/useFunnel'
import type { MenuManifestSection } from '../../../models/menu-detail.model.ts'

const props = defineProps<{
  view: MenuDetailView | null
}>()

const emit = defineEmits<{
  (event: 'add', item: MenuDetailOrderItem): void
}>()

const activeSectionId = ref('')
const activeSections = computed<MenuManifestSection[]>(() =>
  (props.view?.menu.content.sections ?? []).filter(
    (section) => section.items.length
  )
)
const activeSection = computed(
  () =>
    activeSections.value.find(
      (section) => section.id === activeSectionId.value
    ) ??
    activeSections.value[0] ??
    null
)

watch(
  activeSections,
  (sections: MenuManifestSection[]) => {
    if (
      sections.some(
        (section: MenuManifestSection) => section.id === activeSectionId.value
      )
    )
      return

    activeSectionId.value = sections[0]?.id || ''
  },
  { immediate: true }
)
</script>

<style scoped>
.kiosk-browse {
  --kiosk-browse-columns: 10.5rem minmax(0, 1fr);
  --kiosk-browse-gap: calc(var(--spacing) * 10);
  --kiosk-browse-padding: 24svh calc(var(--spacing) * 8)
    calc(var(--spacing) * 8) 0;
  --kiosk-dish-columns: repeat(3, minmax(0, 1fr));

  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: var(--kiosk-browse-columns);
  gap: var(--kiosk-browse-gap);
  width: 100%;
  height: 100svh;
  min-height: 0;
  padding: var(--kiosk-browse-padding);
  overflow: hidden;
  overscroll-behavior: none;
  background: rgb(0 0 0 / 20%);
}

.kiosk-browse__menu,
.kiosk-browse__content {
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.kiosk-browse__menu {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-left: calc(var(--spacing) * 3);
  color: white;
}

.kiosk-browse__content-header h2 {
  margin: 0;
}

.kiosk-browse__sections,
.kiosk-browse__dishes,
.kiosk-browse__dish-section {
  display: grid;
  gap: calc(var(--spacing) * 3);
}

.kiosk-browse__sections {
  gap: 0.55rem;
  margin-top: calc(var(--spacing) * 3);
}

.kiosk-browse__dishes {
  grid-template-columns: var(--kiosk-dish-columns);
  align-items: start;
}

.kiosk-browse__sections,
.kiosk-browse__content {
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.kiosk-browse__section {
  width: 100%;
  max-width: 9.75rem;
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: calc(var(--ui-radius) * 2);
  background: rgb(0 0 0 / 38%);
  backdrop-filter: blur(16px);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 8%);
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: var(--font-weight-extrabold);
  text-align: left;
}

.kiosk-browse__section {
  min-height: 2.7rem;
  padding: 0.58rem 0.65rem 0.58rem 0.78rem;
  background: rgb(0 0 0 / 28%);
  color: rgb(255 255 255 / 78%);
  font-size: 0.9rem;
}

.kiosk-browse__section--active {
  border-color: color-mix(in srgb, var(--kiosk-primary) 62%, transparent);
  background: rgb(0 0 0 / 52%);
  box-shadow:
    inset 0.35rem 0 0 var(--kiosk-primary),
    inset 0 1px 0 rgb(255 255 255 / 8%);
  color: white;
}

.kiosk-browse__content {
  padding: calc(var(--spacing) * 6);
  background: transparent;
  color: white;
}

.kiosk-browse__content-header {
  padding-bottom: calc(var(--spacing) * 4);
}

.kiosk-browse__content-header h2 {
  color: white;
  font-size: 2.5rem;
  font-weight: var(--font-weight-black);
  text-shadow: 0 0.35rem 1rem rgb(0 0 0 / 38%);
}

.kiosk-browse__empty {
  position: relative;
  z-index: 1;
  margin: 0;
  color: white;
  font-size: 2rem;
  font-weight: var(--font-weight-black);
}

@media (max-width: 1100px) and (max-height: 900px) {
  .kiosk-browse {
    --kiosk-browse-columns: 9.5rem minmax(0, 1fr);
    --kiosk-browse-gap: calc(var(--spacing) * 6);
    --kiosk-browse-padding: 22svh calc(var(--spacing) * 5)
      calc(var(--spacing) * 5) 0;
    --kiosk-dish-columns: repeat(auto-fill, minmax(12.5rem, 1fr));
  }

  .kiosk-browse__section {
    max-width: 8.85rem;
  }
}

@media (max-width: 900px) {
  .kiosk-browse {
    --kiosk-browse-columns: 8.5rem minmax(0, 1fr);
    --kiosk-browse-gap: calc(var(--spacing) * 4);
    --kiosk-browse-padding: 18svh calc(var(--spacing) * 4)
      calc(var(--spacing) * 4) 0;
    --kiosk-dish-columns: repeat(2, minmax(0, 1fr));
  }

  .kiosk-browse__section {
    max-width: 7.85rem;
  }
}

@media (max-width: 640px) {
  .kiosk-browse {
    --kiosk-browse-columns: 1fr;
    --kiosk-browse-padding: 18svh calc(var(--spacing) * 4)
      calc(var(--spacing) * 4);
    --kiosk-dish-columns: repeat(auto-fill, minmax(11.5rem, 1fr));

    grid-template-rows: auto minmax(0, 1fr);
  }

  .kiosk-browse__menu {
    gap: calc(var(--spacing) * 2);
    padding-left: 0;
    overflow: visible;
  }

  .kiosk-browse__sections {
    display: flex;
    gap: calc(var(--spacing) * 2);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    padding-bottom: 0.2rem;
    scrollbar-width: none;
  }

  .kiosk-browse__sections::-webkit-scrollbar {
    display: none;
  }

  .kiosk-browse__sections {
    margin-top: 0.15rem;
  }

  .kiosk-browse__section {
    flex: 0 0 auto;
    width: auto;
    max-width: none;
    white-space: nowrap;
  }

  .kiosk-browse__section {
    min-height: 2.55rem;
    padding: 0.55rem calc(var(--spacing) * 3) 0.55rem 0.9rem;
  }

  .kiosk-browse__content {
    padding: 0.35rem 0 0;
  }

  .kiosk-browse__content-header h2 {
    font-size: clamp(1.75rem, 6vw, var(--text-4xl));
  }
}

@media (max-width: 560px) {
  .kiosk-browse {
    --kiosk-browse-padding: 16svh 0.85rem 0.85rem;
    --kiosk-dish-columns: 1fr;
  }
}
</style>
