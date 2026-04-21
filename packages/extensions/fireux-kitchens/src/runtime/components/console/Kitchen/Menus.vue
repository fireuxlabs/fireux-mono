<template>
  <section class="console-surface space-y-4">
    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Focus</div>
        </div>
      </template>

      <div class="space-y-3">
        <p class="console-card-header__description">
          Selected kitchen and menu collection in scope.
        </p>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Kitchen:
            <span class="console-summary-value">{{ selectedKitchenName }}</span>
          </div>
          <div class="console-summary-field">
            Mode:
            <span class="console-summary-value">{{ selectedModeLabel }}</span>
          </div>
          <div class="console-summary-field">
            Menus:
            <span class="console-summary-value">{{ menuCountLabel }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <UAlert
      v-if="pending"
      color="neutral"
      variant="soft"
      title="Loading menus"
      description="Fetching menus for the selected kitchen."
    />

    <OrganismsMenuCollectionManager
      v-else
      :collection="menus"
      title="Menus"
      description="Browse menus for the selected kitchen."
      :link="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsole } from '../../../composables/fireux/app/kitchen-console/useKitchenConsole'
import { useKitchenConsoleMenus } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenus'

const { selectedKitchen, selectedMode } = useKitchenConsole()
const { menus, pending } = useKitchenConsoleMenus()

const selectedKitchenName = computed(() => String(selectedKitchen.value?.name || '').trim() || 'Untitled')
const menuCountLabel = computed(() => String(menus.value.length))
const selectedModeLabel = computed(() =>
  selectedMode.value === 'demo' ? 'Demo' : selectedMode.value === 'test' ? 'Test' : 'Live'
)
</script>
