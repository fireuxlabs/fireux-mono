<template>
  <section class="console-surface space-y-6">
    <ConsoleKitchenOperationsMenusWorkspaceHeader current-label="Collection" />

    <UCard>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-2xl space-y-1">
          <h1 class="text-lg font-semibold text-highlighted">
            Collection
          </h1>
          <p class="text-sm leading-6 text-dimmed">
            Configure when this Menu accepts pickup orders. These settings belong
            only to Collection and do not change Delivery or private surfaces.
          </p>
        </div>

        <UBadge :color="collectionConfig ? 'success' : 'neutral'" variant="soft">
          {{ collectionConfig ? 'Enabled' : 'Disabled' }}
        </UBadge>
      </div>
    </UCard>

    <UAlert
      v-if="!menu"
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Menu unavailable"
      description="Return to Menus and choose a Menu before configuring Collection."
    />

    <UCard v-else-if="!collectionConfig">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-highlighted">
            Collection is not enabled
          </h2>
          <p class="text-sm text-dimmed">
            Enable it to create an independent Collection policy for this Menu.
          </p>
        </div>

        <UButton
          icon="i-lucide-shopping-bag"
          :disabled="!canWrite"
          :loading="enabling"
          @click="enableCollection"
        >
          Enable Collection
        </UButton>
      </div>
    </UCard>

    <ConsoleKitchenOperationsMenusOrderingCollectionTiming
      v-else
      :config="collectionConfig"
      :disabled="!canWrite"
      :kitchen-hours="kitchenOperationHours"
      :saving="saving"
      @save="saveCollection"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import type { MenuOrderTypeConfig } from '../../../../../../models/kitchen/menu/menu.model'
import { useKitchenConsoleMenuOrdering } from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenuOrdering'

const {
  canWrite,
  collectionConfig,
  kitchenOperationHours,
  menu,
  saveOrderTypeConfig,
  setOrderType,
} = useKitchenConsoleMenuOrdering()
const toast = useToastify()
const enabling = ref(false)
const saving = ref(false)

async function enableCollection() {
  if (enabling.value) return
  enabling.value = true
  try {
    await setOrderType('collection', true)
  } finally {
    enabling.value = false
  }
}

async function saveCollection(config: MenuOrderTypeConfig) {
  if (saving.value) return
  saving.value = true
  try {
    await saveOrderTypeConfig(config)
    toast.add({
      title: 'Collection timing updated',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } finally {
    saving.value = false
  }
}
</script>
