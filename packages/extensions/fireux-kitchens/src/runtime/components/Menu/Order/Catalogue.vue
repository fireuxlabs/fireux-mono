<template>
  <section
    class="menu-order-catalogue"
    data-menu-order-catalogue="selectable"
    aria-label="Menu items"
  >
    <MenuSectionNav
      v-if="catalogueSections.length > 1"
      :sections="catalogueSections"
    />

    <div
      v-if="catalogueSections.length"
      class="menu-order-catalogue__sections menu-catalogue-sections"
    >
      <section
        v-for="section in catalogueSections"
        :id="section.anchor"
        :key="section.anchor"
        class="menu-order-catalogue__section menu-catalogue-section"
        :aria-labelledby="section.headingId"
      >
        <h3
          :id="section.headingId"
          class="menu-catalogue-section__heading"
          tabindex="-1"
        >
          {{ section.label }}
        </h3>

        <div class="menu-order-catalogue__items">
          <MenuOrderItem
            v-for="item in section.items"
            :key="item.id"
            :currency-code="currencyCode"
            :item="item"
            @add="addItem"
            @select="openItem(item, $event)"
          />
        </div>
      </section>
    </div>

    <p v-else class="menu-order-catalogue__empty" role="status">
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
import { computed, nextTick, ref, shallowRef } from 'vue'
import type {
  MenuManifestItem,
  MenuManifestSection,
} from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuOrderBasketInput } from '../../../composables/fireux/menu/order/useMenuOrderBasket'
import { menuSectionLinks } from '../../../utils/menu-section-links'

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

const activeItem = shallowRef<MenuManifestItem | null>(null)
const activeTrigger = shallowRef<HTMLButtonElement | null>(null)
const activeVariantId = ref('')
const dialogOpen = ref(false)
const catalogueSections = computed(() => menuSectionLinks(props.sections))

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
.menu-order-catalogue,
.menu-order-catalogue__items {
  display: grid;
}

.menu-order-catalogue {
  gap: 1.5rem;
  text-align: left;
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
