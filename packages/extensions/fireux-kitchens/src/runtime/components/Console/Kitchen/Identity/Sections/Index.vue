<!-- Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: compose Kitchen-owned payment and Delivery configuration. -->
<!-- Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: compose linked Place/Kitchen identity and include directory publication onboarding. -->
<template>
  <ClientOnly>
    <div v-if="kitchen && !placePending" class="space-y-6">
      <KitchenCardsPreview
        v-if="previewModel"
        v-bind="previewModel"
        :show-badges="false"
      />

      <ConsoleKitchenIdentityStage
        number="01"
        title="Root Kitchen identity"
        description="Canonical Kitchen identity. Inherited Place values count when they resolve deliberately; duplicate overrides are not required."
        :percent="rootPercent"
        :complete="rootComplete"
        :requirements="rootRequirements"
      >
        <ConsoleKitchenIdentitySectionsLogo
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

        <ConsoleKitchenIdentitySectionsWordmark
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
          :collection-path="rootCollection"
          :can-write="canWrite"
        />

        <ConsoleKitchenIdentitySectionsPublication
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
          :can-write="canWrite && rootComplete"
        />
      </ConsoleKitchenIdentityStage>

      <ConsoleKitchenIdentityStage
        number="02"
        title="Console identity"
        description="Portable Kitchen Menu PageStyle and Console-owned service presentation. This is not an App template."
        :percent="consolePercent"
        :complete="consoleComplete"
        :locked="!rootComplete"
        locked-title="Root Kitchen identity is incomplete"
        locked-description="Finish every Root requirement above before configuring Console identity."
        :requirements="consoleRequirements"
      >
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-palette"
          to="/console/kitchen/identity/theme"
        >
          Open menu display theme
        </UButton>

        <ConsoleKitchenIdentitySectionsSproochli
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
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
      </ConsoleKitchenIdentityStage>

      <ConsoleKitchenIdentityStage
        number="03"
        title="App identity"
        description="An App-owned Brand System extends the completed Console identity across every tenant and franchise Kitchen."
        :percent="appPercent"
        :complete="appComplete"
        :locked="!consoleComplete"
        locked-title="Console identity is incomplete"
        locked-description="Complete Root and Console identity before an App Brand System can be applied."
        :requirements="appRequirements"
      >
        <UAlert
          color="neutral"
          variant="subtle"
          icon="i-lucide-blocks"
          title="Brand System authoring is not available yet"
          description="This page will not invent App palette, asset, template, or franchise-version storage before that authority is implemented."
        />
      </ConsoleKitchenIdentityStage>
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
import { useKitchenIdentityProgression } from '../../../../../composables/fireux/console/kitchen/identity/useKitchenIdentityProgression'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'
import { useKitchenInterface } from '../../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenSurface } from '../../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { menuAcceptsOrderType } from '../../../../../utils/menu-ordering-policy'
import ConsoleKitchenIdentitySectionsKitchen from './Kitchen.vue'
import ConsoleKitchenIdentitySectionsLogo from './Logo.vue'
import ConsoleKitchenIdentitySectionsWordmark from './Wordmark.vue'

const {
  selectedKitchen,
  kitchenId,
  rootCollection,
  canWrite,
  place,
  placePending,
  rootRequirements,
  rootPercent,
  rootComplete,
  consoleRequirements,
  consolePercent,
  consoleComplete,
  appRequirements,
  appPercent,
  appComplete,
} = useKitchenIdentityProgression()
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
