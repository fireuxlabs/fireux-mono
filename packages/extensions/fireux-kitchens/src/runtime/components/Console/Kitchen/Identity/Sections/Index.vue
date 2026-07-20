<!-- Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: compose Kitchen-owned payment and Delivery configuration. -->
<!-- Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: compose linked Place/Kitchen identity and include directory publication onboarding. -->
<template>
  <ClientOnly>
    <div v-if="kitchen" class="space-y-6">
      <KitchenCardsPreview
        v-if="previewModel"
        v-bind="previewModel"
        :show-badges="false"
      />

      <div class="space-y-4">
        <ConsoleKitchenIdentitySectionsPlace
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
          :collection-path="rootCollection"
          :can-write="canWrite"
        />

        <ConsoleKitchenIdentitySectionsKitchen
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
          :collection-path="rootCollection"
          :can-write="canWrite"
        />

        <ConsoleKitchenIdentitySectionsPublication
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
          :can-write="canWrite"
        />

        <ConsoleKitchenIdentitySectionsWordmark
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
          :collection-path="rootCollection"
          :can-write="canWrite"
        />

        <ConsoleKitchenIdentitySectionsOperationHours
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
          :collection-path="rootCollection"
          :can-write="canWrite"
        />

        <ConsoleKitchenIdentitySectionsPayments
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
          :collection-path="rootCollection"
          :can-write="canWrite"
        />

        <ConsoleKitchenIdentitySectionsDelivery
          v-if="hasDeliveryMenus"
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
          :collection-path="rootCollection"
          :can-write="canWrite"
        />
      </div>
    </div>

    <MoleculesStateCard
      v-else
      entity="kitchen identity"
      kind="document"
      loading
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleIdentity } from '../../../../../composables/fireux/console/kitchen/identity/useKitchenConsoleIdentity'
import { useKitchenConsolePlace } from '../../../../../composables/fireux/console/kitchen/identity/useKitchenConsolePlace'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'
import { useKitchenInterface } from '../../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenSurface } from '../../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { menuAcceptsOrderType } from '../../../../../utils/menu-ordering-policy'
import ConsoleKitchenIdentitySectionsKitchen from './Kitchen.vue'
import ConsoleKitchenIdentitySectionsPlace from './Place.vue'
import ConsoleKitchenIdentitySectionsWordmark from './Wordmark.vue'

const { selectedKitchen, kitchenId, rootCollection, canWrite } =
  useKitchenConsoleIdentity()
const { place } = useKitchenConsolePlace()
const { menus } = useKitchenConsoleMenus()
const { preview, surface } = useKitchenInterface()
const kitchen = computed(
  () => selectedKitchen.value as KitchenSurface | null
)
const resolvedKitchen = computed(() => surface({
  kitchen: kitchen.value,
  place: place.value,
}))
const previewModel = computed(() => preview(resolvedKitchen.value))
const hasDeliveryMenus = computed(() =>
  menus.value.some((menu) => menuAcceptsOrderType(menu, 'delivery'))
)
</script>
