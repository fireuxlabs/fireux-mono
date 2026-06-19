<template>
  <slot
    :menu="menu"
    :pending="pending"
    :error="error"
    :render-menu="renderMenu"
  >
    <section>
      <p v-if="pending">
        Loading menu...
      </p>

      <p v-else-if="error">
        Menu unavailable.
      </p>

      <article v-else-if="renderMenu">
        <p v-if="renderMenu.kitchenName">
          {{ renderMenu.kitchenName }}
        </p>
        <h1>{{ renderMenu.name }}</h1>
        <p v-if="renderMenu.description">
          {{ renderMenu.description }}
        </p>

        <section
          v-for="section in renderMenu.sections"
          :key="section.id"
        >
          <h2>{{ section.label }}</h2>

          <article
            v-for="item in section.items"
            :key="item.id"
          >
            <h3>{{ item.name }}</h3>
            <p v-if="item.description">
              {{ item.description }}
            </p>
            <p v-if="item.priceLabel">
              {{ item.priceLabel }}
            </p>
          </article>
        </section>
      </article>

      <p v-else>
        Menu unavailable.
      </p>

      <details>
        <summary>Menu debug</summary>
        <pre>{{ debug }}</pre>
      </details>
    </section>
  </slot>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMenuFetch } from '../composables/fireux/public/menu/useMenuFetch'

const props = defineProps<{
  menuId: string
  kitchenSlug?: string
}>()

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : []
const menuId = computed(() => text(props.menuId))
const kitchenSlug = computed(() => text(props.kitchenSlug))
const {
  menu,
  pending,
  error,
} = useMenuFetch(menuId, { kitchenSlug })

const itemName = (item: Record<string, unknown>) =>
  text(item.name) || text(record(item.item).name)

const itemDescription = (item: Record<string, unknown>) =>
  text(item.description) || text(record(item.item).description)

const itemPriceLabel = (item: Record<string, unknown>) =>
  text(item.priceLabel) ||
  text(item.price_label) ||
  text(item.price)

const renderMenu = computed(() => {
  const source = menu.value
  if (!source) return null

  return {
    id: source.id,
    name: text(source.name) || 'Menu',
    description: text(source.description),
    kitchenName:
      text(source.source?.kitchen_name) ||
      text(record(source.kitchen).name),
    sections: list(source.sections).map((section, sectionIndex) => {
      const sectionRecord = record(section)
      const nestedSection = record(sectionRecord.section)
      const label =
        text(sectionRecord.label) ||
        text(nestedSection.label) ||
        `Section ${sectionIndex + 1}`

      return {
        id: text(sectionRecord.id) || text(nestedSection.id) || label,
        label,
        items: list(sectionRecord.items).map((item, itemIndex) => {
          const itemRecord = record(item)
          const name = itemName(itemRecord) || `Item ${itemIndex + 1}`

          return {
            id: text(itemRecord.id) || name,
            name,
            description: itemDescription(itemRecord),
            priceLabel: itemPriceLabel(itemRecord),
          }
        }),
      }
    }),
  }
})
const debug = computed(() => ({
  props,
  derived: {
    menuId: menuId.value,
    kitchenSlug: kitchenSlug.value,
    pending: pending.value,
    hasError: Boolean(error.value),
    hasMenu: Boolean(menu.value),
    sectionsCount: renderMenu.value?.sections.length || 0,
  },
  menu: menu.value,
  renderMenu: renderMenu.value,
}))
</script>
