<template>
  <section
    class="menu-order-catalogue"
    data-menu-order-catalogue="selectable"
    aria-labelledby="menu-order-catalogue-title"
  >
    <h2 id="menu-order-catalogue-title" class="menu-order-catalogue__title">
      Choose your items
    </h2>

    <div v-if="sections.length" class="menu-order-catalogue__sections">
      <section
        v-for="(section, sectionIndex) in sections"
        :key="section.id"
        class="menu-order-catalogue__section"
        :aria-labelledby="sectionHeadingId(sectionIndex)"
      >
        <h3 :id="sectionHeadingId(sectionIndex)">
          {{ section.label }}
        </h3>

        <div class="menu-order-catalogue__items">
          <MenuOrderItem
            v-for="item in section.items"
            :key="item.id"
            :currency-code="currencyCode"
            :item="item"
            @select="openItem(item, $event)"
          />
        </div>
      </section>
    </div>

    <p v-else class="menu-order-catalogue__empty" role="status">
      No items are currently available for collection.
    </p>

    <MenuOrderItemDialog
      v-if="activeItem"
      v-model:open="dialogOpen"
      :currency-code="currencyCode"
      :item="activeItem"
      @add="addItem"
      @after-leave="finishDialog"
    />
  </section>
</template>

<script setup lang="ts">
import { nextTick, ref, shallowRef } from 'vue'
import type {
  MenuManifestItem,
  MenuManifestSection,
} from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuOrderBasketInput } from '../../../composables/fireux/menu/order/useMenuOrderBasket'

defineProps<{
  currencyCode: string
  sections: MenuManifestSection[]
}>()

const emit = defineEmits<{
  (event: 'add', input: MenuOrderBasketInput): void
}>()

const activeItem = shallowRef<MenuManifestItem | null>(null)
const activeTrigger = shallowRef<HTMLButtonElement | null>(null)
const dialogOpen = ref(false)

function sectionHeadingId(index: number) {
  return `menu-order-section-${index + 1}`
}

function openItem(item: MenuManifestItem, trigger: HTMLButtonElement) {
  activeItem.value = item
  activeTrigger.value = trigger
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

  void nextTick(() => trigger?.focus())
}
</script>

<style scoped>
.menu-order-catalogue,
.menu-order-catalogue__sections,
.menu-order-catalogue__section,
.menu-order-catalogue__items {
  display: grid;
}

.menu-order-catalogue {
  gap: 1.5rem;
  text-align: left;
}

.menu-order-catalogue__title {
  margin: 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  line-height: 1.1;
}

.menu-order-catalogue__sections {
  gap: clamp(2.5rem, 6vw, 4.5rem);
}

.menu-order-catalogue__section {
  gap: 1rem;
}

.menu-order-catalogue__section h3 {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  line-height: 1.3;
  text-transform: uppercase;
}

.menu-order-catalogue__items {
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
}

.menu-order-catalogue__empty {
  margin: 0;
  color: var(--menu-muted);
  line-height: 1.6;
}
</style>
