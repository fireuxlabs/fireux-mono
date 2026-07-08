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

        <ConsoleKitchenIdentitySectionsOperationHours
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
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'
import { useKitchenInterface } from '../../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenSurface } from '../../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { menuAcceptsOrderType } from '../../../../../utils/menu-ordering-policy'
import ConsoleKitchenIdentitySectionsKitchen from './Kitchen.vue'
import ConsoleKitchenIdentitySectionsPlace from './Place.vue'

const { selectedKitchen, kitchenId, rootCollection, canWrite } =
  useKitchenConsoleIdentity()
const { menus } = useKitchenConsoleMenus()
const { preview } = useKitchenInterface()
const kitchen = computed(
  () => selectedKitchen.value as KitchenSurface | null
)
const previewModel = computed(() => preview(kitchen.value))
const hasDeliveryMenus = computed(() =>
  menus.value.some((menu) => menuAcceptsOrderType(menu, 'delivery'))
)
</script>
