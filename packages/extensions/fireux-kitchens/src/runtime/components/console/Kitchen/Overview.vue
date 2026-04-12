<template>
  <section class="console-surface">
    <div v-if="kitchen" class="console-surface__grid console-surface__grid--2">
      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Focus</div>
            <p class="console-card-header__description">
              Metrics for the selected kitchen.
            </p>
          </div>
        </template>

        <div class="console-focus">
          <div class="console-focus__title">
            {{ kitchenTitle }}
          </div>

          <div class="console-metric">
            <div class="console-metric__value">
              {{ focusMetricValue }}
            </div>
            <div class="console-metric__label">{{ focusMetricLabel }}</div>
          </div>

          <p class="console-card-header__description">
            {{ focusMetricSummary }}
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">All</div>
            <p class="console-card-header__description">
              Metrics across every kitchen in the collection.
            </p>
          </div>
        </template>

        <div class="console-focus">
          <div class="console-focus__title">
            All Kitchens
          </div>

          <div class="console-metric">
            <div class="console-metric__value">
              {{ totalKitchensLabel }}
            </div>
            <div class="console-metric__label">Kitchens</div>
          </div>

          <p class="console-card-header__description">
            {{ allMetricSummary }}
          </p>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Kitchen Summary</div>
          <p class="console-card-header__description">
            Live details for the currently selected kitchen.
          </p>
        </div>
      </template>

      <div v-if="kitchen" class="console-summary-grid">
        <div class="console-summary-field">
          Kitchen ID:
          <span class="console-summary-value">{{ kitchenId }}</span>
        </div>
        <div class="console-summary-field">
          App ID:
          <span class="console-summary-value">{{ appId }}</span>
        </div>
        <div v-if="kitchenName" class="console-summary-field">
          Name:
          <span class="console-summary-value">{{ kitchenName }}</span>
        </div>
        <div v-if="kitchenShortName" class="console-summary-field">
          Short Name:
          <span class="console-summary-value">{{ kitchenShortName }}</span>
        </div>
        <div v-if="kitchenAddress" class="console-summary-field">
          Address:
          <span class="console-summary-value">{{ kitchenAddress }}</span>
        </div>
        <div class="console-summary-field">
          Active Menus:
          <span class="console-summary-value">{{ activeMenusCount }}</span>
        </div>
        <div class="console-summary-field">
          Live Orders:
          <span class="console-summary-value">{{ liveOrdersCount }}</span>
        </div>
        <div class="console-summary-field">
          Open Mise:
          <span class="console-summary-value">{{ openMiseCount }}</span>
        </div>
        <div class="console-summary-field">
          Recipes:
          <span class="console-summary-value">{{ recipes.length }}</span>
        </div>
        <div v-if="kitchenWebsite" class="console-summary-field console-summary-field--full">
          Website:
          <span class="console-summary-value break-all">{{ kitchenWebsite }}</span>
        </div>
        <div v-if="kitchenTagline" class="console-summary-field console-summary-field--full">
          Tagline:
          <span class="console-summary-value">{{ kitchenTagline }}</span>
        </div>
        <div class="console-summary-field console-summary-field--full">
          Operational Path:
          <span class="console-summary-value break-all">{{ operationalKitchenPath }}</span>
        </div>
      </div>

      <p v-else class="console-card-header__description">
        No live kitchen is currently selected.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'
import { resolveKitchenConsoleCollectionPath } from '../../../composables/fireux/app/kitchen-console/shared'
import { useRuntimeKitchenData } from '../../../composables/fireux/app/kitchen-console/useRuntimeKitchenData'
import { useKitchenCollection } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'

const { kitchenState, kitchen } = useKitchenConsole()
const { appId } = useFireUXConfig()
const { count: totalKitchens } = useKitchenCollection()
const selectedKitchen = computed(
  () => kitchenState.kitchen.value as Record<string, unknown> | null
)
const isDemo = computed(() => false)
const kitchenCollectionPath = computed(() => resolveKitchenConsoleCollectionPath(appId))
const runtimeData = useRuntimeKitchenData({
  id: kitchenState.id,
  isDemo,
  kitchenCollectionPath,
})

const normalizeString = (value: unknown): string => String(value || '').trim()

const kitchenId = computed(() => kitchenState.id.value)
const menus = computed(() => runtimeData.value.menus ?? [])
const recipes = computed(() => runtimeData.value.recipes ?? [])
const miseTasks = computed(() => runtimeData.value.miseTasks ?? [])
const kitchenOrders = computed(() => runtimeData.value.kitchenOrders ?? [])
const suppliers = computed(() => runtimeData.value.suppliers ?? [])
const kitchenName = computed(() => normalizeString(selectedKitchen.value?.name))
const kitchenShortName = computed(() => normalizeString(selectedKitchen.value?.short_name))
const kitchenAddress = computed(() =>
  normalizeString(
    selectedKitchen.value?.formatted_address || selectedKitchen.value?.short_address
  )
)
const kitchenWebsite = computed(() => normalizeString(selectedKitchen.value?.website))
const kitchenTagline = computed(() => normalizeString(selectedKitchen.value?.brand_tagline))

const kitchenTitle = computed(
  () =>
    kitchen.value?.title ||
    kitchenName.value ||
    kitchenShortName.value ||
    kitchenId.value ||
    'Selected Kitchen'
)
const operationalKitchenPath = computed(() =>
  kitchenId.value ? `${kitchenCollectionPath.value}/${kitchenId.value}` : ''
)
const activeMenusCount = computed(
  () => menus.value.filter((menu) => Boolean(menu?.active)).length
)
const liveOrdersCount = computed(
  () =>
    kitchenOrders.value.filter((order) =>
      ['submitted', 'accepted', 'in_progress', 'ready'].includes(
        normalizeString(order?.status)
      )
    ).length
)
const openMiseCount = computed(
  () =>
    miseTasks.value.filter(
      (task) => normalizeString(task?.status) !== 'done'
    ).length
)
const blockedMiseCount = computed(
  () =>
    miseTasks.value.filter(
      (task) => normalizeString(task?.status) === 'blocked'
    ).length
)
const suppliersCount = computed(() => suppliers.value.length)
const totalKitchensLabel = computed(() => String(totalKitchens.value || 0))
const focusMetricValue = computed(() => String(liveOrdersCount.value))
const focusMetricLabel = computed(() => 'Live Orders')
const focusMetricSummary = computed(() => {
  const parts = [
    `${activeMenusCount.value} active menu${activeMenusCount.value === 1 ? '' : 's'}`,
    `${openMiseCount.value} open mise task${openMiseCount.value === 1 ? '' : 's'}`,
  ]

  if (blockedMiseCount.value) {
    parts.push(`${blockedMiseCount.value} blocked`)
  }

  return parts.join(' · ')
})
const allMetricSummary = computed(() => {
  if (!Number(totalKitchensLabel.value)) {
    return 'No kitchens are currently in scope.'
  }

  return `Total kitchens in scope: ${totalKitchensLabel.value}. Suppliers connected to this kitchen: ${suppliersCount.value}.`
})
</script>
