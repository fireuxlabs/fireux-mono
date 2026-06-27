<template>
  <ClientOnly>
    <div v-if="kitchen" class="space-y-6">
      <ConsoleKitchenIdentitySectionsSummary
        :kitchen="kitchen"
        :kitchen-id="kitchenId"
        :can-write="canWrite"
      />

      <div class="space-y-4">
        <ConsoleKitchenIdentitySectionsSection
          title="Identity"
          description="Manage guest-facing credentials, theme, and more."
          icon="i-lucide-store"
        >
          <div class="space-y-4">
            <ConsoleKitchenIdentitySectionsBasics
              :kitchen="kitchen"
              :kitchen-id="kitchenId"
              :can-write="canWrite"
            />

            <ConsoleKitchenIdentitySectionsPlaceTheme />
          </div>
        </ConsoleKitchenIdentitySectionsSection>

        <ConsoleKitchenIdentitySectionsSection
          v-if="hasDeliveryMenus"
          title="Delivery"
          description="Delivery zones for menus that accept delivery orders."
          icon="i-lucide-truck"
        >
          <ConsoleKitchenIdentitySectionsFulfilment
            :kitchen="kitchen"
            :kitchen-id="kitchenId"
            :collection-path="rootCollection"
            :can-write="canWrite"
          />
        </ConsoleKitchenIdentitySectionsSection>
      </div>
    </div>

    <MoleculesStateCard v-else entity="kitchen identity" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleIdentity } from '../../../../../composables/fireux/console/kitchen/identity/useKitchenConsoleIdentity'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'
import { menuAcceptsOrderType } from '../../../../../utils/menu-ordering-policy'

const { selectedKitchen, kitchenId, rootCollection, canWrite } = useKitchenConsoleIdentity()
const { menus } = useKitchenConsoleMenus()
const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const hasDeliveryMenus = computed(() =>
  menus.value.some((menu) => menuAcceptsOrderType(menu, 'delivery'))
)
</script>
