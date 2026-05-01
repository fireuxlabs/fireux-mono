<template>
  <section class="space-y-4">
    <UCard v-if="menusSorted.length">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Menu Profiles</div>
          <p class="console-card-header__description">
            Lightweight operator preview of the selected kitchen's service menus.
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <UCard
          v-for="menu in menusSorted"
          :key="menu.id || menu.name"
          variant="soft"
        >
          <template #header>
            <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div class="space-y-1">
                <div class="text-lg font-semibold">
                  {{ menu.name || menu.id || 'Untitled menu' }}
                </div>
                <p v-if="menu.description" class="text-sm text-dimmed">
                  {{ menu.description }}
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge :color="menu.active === false ? 'neutral' : 'success'" variant="soft">
                  {{ menu.active === false ? 'Inactive' : 'Active' }}
                </UBadge>
                <UBadge variant="soft">
                  {{ menu.currency_code || 'CHF' }}
                </UBadge>
              </div>
            </div>
          </template>

          <div class="space-y-4">
            <div class="console-summary-grid">
              <div class="console-summary-field">
                Sections:
                <span class="console-summary-value">
                  {{ menuSections(menu).length }}
                </span>
              </div>
              <div class="console-summary-field">
                Items:
                <span class="console-summary-value">
                  {{ menuItemCount(menu) }}
                </span>
              </div>
            </div>

            <UAccordion
              v-if="menuSections(menu).length"
              type="multiple"
              class="space-y-2"
            >
              <UAccordionItem
                v-for="section in menuSections(menu)"
                :key="section.id || section.label"
                :value="String(section.id || section.label || 'section')"
                :title="sectionTitle(section)"
              >
                <template #body>
                  <div v-if="sectionItems(section).length" class="space-y-2">
                    <div
                      v-for="item in sectionItems(section).slice(0, 4)"
                      :key="item.id || item.dish_id || item.label"
                      class="flex items-center justify-between gap-3 rounded border border-default p-2 text-sm"
                    >
                      <span class="font-medium">
                        {{ item.label || item.dish_id || 'Untitled item' }}
                      </span>
                      <span class="text-dimmed">
                        {{ formatPrice(item.price_minor, item.currency_code || menu.currency_code) }}
                      </span>
                    </div>

                    <p
                      v-if="sectionItems(section).length > 4"
                      class="text-xs text-dimmed"
                    >
                      +{{ sectionItems(section).length - 4 }} more items
                    </p>
                  </div>

                  <p v-else class="text-sm text-dimmed">
                    No items in this section yet.
                  </p>
                </template>
              </UAccordionItem>
            </UAccordion>

            <UAlert
              v-else
              color="neutral"
              variant="soft"
              title="No sections"
              description="This menu does not have any sections yet."
            />
          </div>
        </UCard>
      </div>
    </UCard>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No menus"
      description="No menus are available for the selected kitchen."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu, MenuSection, MenuSectionItem } from '../../../../models/menu.model'

const props = withDefaults(
  defineProps<{
    collection?: Menu[]
  }>(),
  {
    collection: () => [],
  }
)

const menusSorted = computed(() =>
  [...props.collection].sort(
    (a, b) =>
      Number(a?.sort_order || 0) - Number(b?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)

const menuSections = (menu: Menu) =>
  Array.isArray(menu.sections)
    ? [...menu.sections].sort(
        (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
      )
    : []

const sectionItems = (section: MenuSection) =>
  Array.isArray(section.items)
    ? [...section.items].sort(
        (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
      )
    : []

const menuItemCount = (menu: Menu) =>
  menuSections(menu).reduce(
    (total, section) => total + sectionItems(section).length,
    0
  )

const sectionTitle = (section: MenuSection) => {
  const label = String(section.label || section.id || 'Untitled section')
  const count = sectionItems(section).length
  return `${label} · ${count} ${count === 1 ? 'item' : 'items'}`
}

const formatPrice = (
  valueMinor: MenuSectionItem['price_minor'],
  currencyCode?: string
) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: String(currencyCode || 'CHF').trim().toUpperCase() || 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(valueMinor || 0) / 100)
</script>
