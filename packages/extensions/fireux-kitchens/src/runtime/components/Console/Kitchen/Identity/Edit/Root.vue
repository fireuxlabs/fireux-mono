<template>
  <ClientOnly>
    <div v-if="kitchen" class="space-y-6">
      <ConsoleKitchenIdentityEditSummary
        :kitchen="kitchen"
        :kitchen-id="kitchenId"
        :can-write="canWrite"
      />

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div class="space-y-4">
          <ConsoleKitchenIdentityEditSection
            title="Public identity"
            description="Guest-facing name, slug, and tagline."
            icon="i-lucide-store"
            :default-open="true"
          >
            <ConsoleKitchenIdentityEditPublicIdentity
              :kitchen="kitchen"
              :kitchen-id="kitchenId"
              :can-write="canWrite"
            />
          </ConsoleKitchenIdentityEditSection>

          <ConsoleKitchenIdentityEditSection
            v-if="hasDeliveryMenus"
            title="Delivery fulfilment"
            description="Delivery zones for menus that accept delivery orders."
            icon="i-lucide-truck"
          >
            <ConsoleKitchenIdentityEditFulfilment
              :kitchen="kitchen"
              :kitchen-id="kitchenId"
              :collection-path="rootCollection"
              :can-write="canWrite"
            />
          </ConsoleKitchenIdentityEditSection>
        </div>

        <ConsoleKitchenIdentityEditLinks />
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
