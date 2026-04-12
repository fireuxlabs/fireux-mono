<template>
  <UDashboardPanel id="console-kitchen-menu">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Menus" />
    </template>

    <template #body>
      <section class="console-surface">
        <UAlert
          v-if="!kitchenState.id"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before opening menus."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <KitchenCardsPill
            v-if="kitchen"
            v-bind="kitchen"
            :link="false"
            :show-badges="false"
          />

          <div class="console-surface__grid console-surface__grid--2">
            <UCard>
              <template #header>
                <div class="console-card-header">
                  <div class="console-card-header__title">Menu Stack</div>
                  <p class="console-card-header__description">
                    Live operational menu data for the selected kitchen.
                  </p>
                </div>
              </template>

              <div class="console-summary-grid">
                <div class="console-summary-field">
                  Kitchen ID:
                  <span class="console-summary-value">{{ kitchenState.id }}</span>
                </div>
                <div class="console-summary-field">
                  App ID:
                  <span class="console-summary-value">{{ appId }}</span>
                </div>
                <div class="console-summary-field">
                  Menus:
                  <span class="console-summary-value">{{ counts.menus }}</span>
                </div>
                <div class="console-summary-field">
                  Active Menus:
                  <span class="console-summary-value">{{ activeMenusCount }}</span>
                </div>
                <div class="console-summary-field">
                  Dishes:
                  <span class="console-summary-value">{{ counts.dishes }}</span>
                </div>
                <div class="console-summary-field">
                  Recipes:
                  <span class="console-summary-value">{{ counts.recipes }}</span>
                </div>
                <div class="console-summary-field">
                  Mise Tasks:
                  <span class="console-summary-value">{{ counts.mise }}</span>
                </div>
                <div class="console-summary-field">
                  Menu Items:
                  <span class="console-summary-value">{{ menuItemsCount }}</span>
                </div>
                <div class="console-summary-field console-summary-field--full">
                  Operational Path:
                  <span class="console-summary-value break-all">{{ menuCollectionPath }}</span>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <div class="console-card-header">
                  <div class="console-card-header__title">Featured Menu</div>
                  <p class="console-card-header__description">
                    Spotlight the current menu shape before we build deeper menu flows.
                  </p>
                </div>
              </template>

              <MenuCardsPreview
                v-if="featuredMenuPreview"
                v-bind="featuredMenuPreview"
              >
                <template #actions>
                  <div class="flex flex-wrap gap-2">
                    <UBadge variant="soft" color="neutral">
                      {{ featuredMenuLabel }}
                    </UBadge>
                  </div>
                </template>
              </MenuCardsPreview>

              <p v-else class="console-card-header__description">
                No menus are wired for this kitchen yet.
              </p>
            </UCard>
          </div>

          <MenuCollectionManager
            :collection="menus"
            title="Menus"
            description="Published menus for the selected kitchen."
            :link="false"
          />
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'
import { resolveKitchenConsoleCollectionPath } from '../../../composables/fireux/app/kitchen-console/shared'
import { useKitchenMenuStackFetch } from '../../../composables/fireux/firestore/runtime-kitchen/stack/fetch/useKitchenMenuStackFetch'
import { useMenuInterface } from '../../../composables/fireux/firestore/runtime-kitchen/menu/utils/view/useMenuInterface'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu',
    label: 'Menus',
    icon: 'i-lucide-book-open',
    position: 'top',
    requiresSelection: true,
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { appId } = useFireUXConfig()
const { kitchenState, kitchen } = useKitchenConsole({
  publishHeader: true,
})
const kitchenCollectionPath = computed(() => resolveKitchenConsoleCollectionPath(appId))
const menuCollectionPath = computed(() =>
  kitchenState.id.value ? `${kitchenCollectionPath.value}/${kitchenState.id.value}/menus` : ''
)
const { menus, counts } = useKitchenMenuStackFetch(kitchenState.id, {
  kitchenCollectionPath,
})
const { preview: toMenuPreview } = useMenuInterface()

const activeMenusCount = computed(
  () => menus.value.filter((menu) => Boolean(menu?.active)).length
)
const menuItemsCount = computed(() =>
  menus.value.reduce(
    (total, menu) =>
      total +
      (Array.isArray(menu?.sections)
        ? menu.sections.reduce(
            (sectionTotal, section) =>
              sectionTotal + (Array.isArray(section?.items) ? section.items.length : 0),
            0
          )
        : 0),
    0
  )
)

const featuredMenu = computed(
  () => menus.value.find((menu) => Boolean(menu?.active)) ?? menus.value[0] ?? null
)
const featuredMenuPreview = computed(() => toMenuPreview(featuredMenu.value))
const featuredMenuLabel = computed(() => {
  if (!featuredMenu.value) return 'No menu selected'
  return featuredMenu.value.active ? 'Active now' : 'First available menu'
})
</script>
