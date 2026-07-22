<!-- Concurrent edit — 2026-07-22 11:23 CEST — Kiosk simplification pass: keep a quiet section rail and one content heading. -->
<template>
  <section
    class="menu-order-kiosk-catalogue"
    data-menu-order-catalogue="selectable"
    aria-label="Menu items"
  >
    <template v-if="catalogueSections.length && activeSection">
      <aside class="menu-order-kiosk-catalogue__rail">
        <nav aria-label="Menu sections">
          <button
            v-for="section in catalogueSections"
            :key="section.anchor"
            type="button"
            class="menu-order-kiosk-catalogue__section"
            :class="{
              'menu-order-kiosk-catalogue__section--active':
                section.anchor === activeSection.anchor,
            }"
            :aria-controls="section.anchor"
            :aria-current="section.anchor === activeSection.anchor ? 'true' : undefined"
            :data-menu-kiosk-section="section.id"
            @click="activeSectionAnchor = section.anchor"
          >
            <span>{{ section.label }}</span>
          </button>
        </nav>
      </aside>

      <main
        :id="activeSection.anchor"
        class="menu-order-kiosk-catalogue__content"
        :aria-labelledby="activeSection.headingId"
      >
        <header class="menu-order-kiosk-catalogue__header">
          <h2 :id="activeSection.headingId">{{ activeSection.label }}</h2>
        </header>

        <div class="menu-order-kiosk-catalogue__items">
          <MenuOrderKioskItem
            v-for="item in activeSection.items"
            :key="item.id"
            :currency-code="currencyCode"
            :item="item"
            @add="addItem"
            @select="openItem(item, $event)"
          />
        </div>
      </main>
    </template>

    <p v-else class="menu-order-kiosk-catalogue__empty" role="status">
      No menu items are currently available.
    </p>

    <MenuOrderItemDialog
      v-if="activeItem"
      v-model:open="dialogOpen"
      :currency-code="currencyCode"
      :initial-variant-id="activeVariantId"
      :item="activeItem"
      @add="addItem"
      @after-leave="finishDialog"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import type {
  MenuManifestItem,
  MenuManifestSection,
} from '../../../../models/kitchen/menu/menu-detail.model'
import type { MenuOrderBasketInput } from '../../../../composables/fireux/menu/order/useMenuOrderBasket'
import {
  menuSectionLinks,
  type MenuSectionLink,
} from '../../../../utils/menu-section-links'

type MenuOrderItemSelection = {
  trigger: HTMLButtonElement
  variantId?: string
}

const props = defineProps<{
  currencyCode: string
  sections: MenuManifestSection[]
}>()

const emit = defineEmits<{
  (event: 'add', input: MenuOrderBasketInput): void
}>()

const activeSectionAnchor = ref('')
const activeItem = shallowRef<MenuManifestItem | null>(null)
const activeTrigger = shallowRef<HTMLButtonElement | null>(null)
const activeVariantId = ref('')
const dialogOpen = ref(false)
const catalogueSections = computed(() =>
  menuSectionLinks(props.sections).filter(section => section.items.length)
)
const activeSection = computed(() =>
  catalogueSections.value.find(
    section => section.anchor === activeSectionAnchor.value
  ) || catalogueSections.value[0] || null
)

watch(catalogueSections, (sections: MenuSectionLink[]) => {
  if (sections.some(
    (section: MenuSectionLink) => section.anchor === activeSectionAnchor.value
  )) return

  activeSectionAnchor.value = sections[0]?.anchor || ''
}, { immediate: true })

function openItem(item: MenuManifestItem, selection: MenuOrderItemSelection) {
  activeItem.value = item
  activeTrigger.value = selection.trigger
  activeVariantId.value = selection.variantId || ''
  dialogOpen.value = true
}

function addItem(input: MenuOrderBasketInput) {
  emit('add', input)
  dialogOpen.value = false
}

function finishDialog() {
  const trigger = activeTrigger.value
  activeItem.value = null
  activeTrigger.value = null
  activeVariantId.value = ''

  void nextTick(() => trigger?.focus())
}
</script>

<style scoped>
.menu-order-kiosk-catalogue {
  display: grid;
  grid-template-columns: clamp(10.5rem, 18vw, 14rem) minmax(0, 1fr);
  height: 100%;
  min-height: 0;
  background: var(--menu-bg);
  text-align: left;
}

.menu-order-kiosk-catalogue__rail,
.menu-order-kiosk-catalogue__content {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.menu-order-kiosk-catalogue__rail {
  padding: clamp(0.75rem, 2vw, 1.25rem) 0.65rem;
  padding-bottom: max(6.5rem, env(safe-area-inset-bottom));
  border-right: 1px solid color-mix(in srgb, var(--menu-text) 13%, transparent);
  background: var(--menu-bg);
}

.menu-order-kiosk-catalogue__rail nav {
  display: grid;
  gap: 0.2rem;
}

.menu-order-kiosk-catalogue__section {
  display: block;
  width: 100%;
  min-height: 3.1rem;
  padding: 0.7rem 0.8rem;
  border: 0;
  border-radius: var(--menu-radius-control);
  background: transparent;
  color: var(--menu-muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.88rem;
  font-weight: var(--font-weight-extrabold);
  text-align: left;
}

.menu-order-kiosk-catalogue__section span {
  overflow-wrap: anywhere;
}

.menu-order-kiosk-catalogue__section--active {
  background: transparent;
  box-shadow: inset 0.18rem 0 0 var(--menu-primary);
  color: var(--menu-primary);
}

.menu-order-kiosk-catalogue__section:focus-visible {
  outline: 3px solid var(--menu-primary);
  outline-offset: 0.15rem;
}

.menu-order-kiosk-catalogue__content {
  padding: clamp(1.25rem, 2.5vw, 2rem);
  padding-bottom: clamp(7rem, 14vh, 9rem);
}

.menu-order-kiosk-catalogue__header {
  margin-bottom: clamp(1.25rem, 2.5vw, 1.75rem);
}

.menu-order-kiosk-catalogue__header h2 {
  margin: 0;
}

.menu-order-kiosk-catalogue__header h2 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1;
  letter-spacing: -0.035em;
}

.menu-order-kiosk-catalogue__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 15rem), 1fr));
  gap: clamp(0.85rem, 1.7vw, 1.25rem);
  align-items: start;
}

.menu-order-kiosk-catalogue__empty {
  grid-column: 1 / -1;
  place-self: center;
  margin: 0;
  color: var(--menu-muted);
  font-size: 1rem;
  font-weight: var(--font-weight-bold);
}

@media (max-width: 700px) {
  .menu-order-kiosk-catalogue {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .menu-order-kiosk-catalogue__rail {
    padding: 0.65rem 0.75rem;
    overflow-y: visible;
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 13%, transparent);
  }

  .menu-order-kiosk-catalogue__rail nav {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }

  .menu-order-kiosk-catalogue__rail nav::-webkit-scrollbar {
    display: none;
  }

  .menu-order-kiosk-catalogue__section {
    flex: 0 0 auto;
    width: auto;
    min-height: 2.8rem;
    white-space: nowrap;
  }

  .menu-order-kiosk-catalogue__section--active {
    box-shadow: inset 0 -0.2rem 0 var(--menu-primary);
  }

  .menu-order-kiosk-catalogue__content {
    padding: 1.1rem;
    padding-bottom: 12rem;
  }

  .menu-order-kiosk-catalogue__header h2 {
    font-size: clamp(1.8rem, 8vw, 2.75rem);
  }

  .menu-order-kiosk-catalogue__items {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 12.5rem), 1fr));
  }
}
</style>
