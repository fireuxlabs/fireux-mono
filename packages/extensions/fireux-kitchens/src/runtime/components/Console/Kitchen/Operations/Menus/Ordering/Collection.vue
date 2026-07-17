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

        <div class="flex items-center gap-2">
          <UBadge v-if="saveState" color="neutral" variant="soft">
            {{ saveState }}
          </UBadge>
          <UBadge :color="collectionConfig ? 'success' : 'neutral'" variant="soft">
            {{ collectionConfig ? 'Enabled' : 'Disabled' }}
          </UBadge>
        </div>
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
      v-else-if="editableCollectionConfig"
      :config="editableCollectionConfig"
      :disabled="!canWrite"
      :menu-hours="menuServiceHours"
      @save="saveCollection"
    />

    <ConsoleKitchenOperationsMenusOrderingCollectionPaymentMethods
      v-if="editableCollectionConfig"
      :config="editableCollectionConfig"
      :disabled="!canWrite"
      @save="saveCollection"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { MenuOrderTypeConfig } from '../../../../../../models/kitchen/menu/menu.model'
import { useKitchenConsoleMenuOrdering } from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenuOrdering'

const {
  canWrite,
  collectionConfig,
  menuServiceHours,
  menu,
  saveOrderTypeConfig,
  setOrderType,
} = useKitchenConsoleMenuOrdering()
const enabling = ref(false)
const saving = ref(false)
const saveState = ref('')
const editableCollectionConfig = ref<MenuOrderTypeConfig | null>(null)
const pendingCollectionConfig = ref<MenuOrderTypeConfig | null>(null)

watch(
  collectionConfig,
  (config: MenuOrderTypeConfig | null) => {
    if (!saving.value || !editableCollectionConfig.value) {
      editableCollectionConfig.value = config
    }
  },
  { immediate: true, deep: true }
)

async function enableCollection() {
  if (enabling.value) return
  enabling.value = true
  try {
    await setOrderType('collection', true)
  } finally {
    enabling.value = false
  }
}

function saveCollection(config: MenuOrderTypeConfig) {
  editableCollectionConfig.value = config
  pendingCollectionConfig.value = config
  saveState.value = 'Pending changes'
  void flushCollectionSave()
}

async function flushCollectionSave() {
  if (saving.value) return
  saving.value = true
  try {
    while (pendingCollectionConfig.value) {
      const config = pendingCollectionConfig.value
      pendingCollectionConfig.value = null
      saveState.value = 'Saving...'
      await saveOrderTypeConfig(config)
    }
    saveState.value = 'Saved'
  } catch {
    saveState.value = 'Save failed'
  } finally {
    saving.value = false
    if (pendingCollectionConfig.value) void flushCollectionSave()
  }
}
</script>
