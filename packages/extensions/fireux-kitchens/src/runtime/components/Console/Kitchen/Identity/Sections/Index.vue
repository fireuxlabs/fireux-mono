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
        title="Your Place"
        description="Shared location identity inherited by this Kitchen. Change the backdrop here without duplicating it on Kitchen."
        :percent="placePercent"
        :complete="placeComplete"
        :requirements="placeRequirements"
      >
        <ConsoleKitchenIdentityPlace />
      </ConsoleKitchenIdentityStage>

      <ConsoleKitchenIdentityStage
        number="02"
        title="Kitchen identity"
        description="Kitchen additions and deliberate overrides above the linked Place."
        :percent="rootPercent"
        :complete="rootComplete"
        :locked="!placeComplete"
        locked-title="Place identity is incomplete"
        locked-description="Finish the linked Place identity before adding Kitchen overrides."
        :requirements="rootRequirements"
      >
        <KitchenEditIdentity
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
          :can-write="canWrite"
        />
      </ConsoleKitchenIdentityStage>

      <ConsoleKitchenIdentityStage
        number="03"
        title="Console theme"
        description="Four functional colours and optional Console typography. This layer exists because the Kitchen has a Console."
        :percent="consolePercent"
        :complete="consoleComplete"
        :locked="!rootComplete"
        locked-title="Kitchen identity is incomplete"
        locked-description="Finish the Place and Kitchen sections before configuring the Console theme."
        :requirements="consoleRequirements"
      >
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-palette"
          to="/console/kitchen/identity/theme"
        >
          Edit Console theme
        </UButton>
      </ConsoleKitchenIdentityStage>

      <ConsoleKitchenIdentityStage
        v-if="hasDedicatedApp"
        number="04"
        title="App identity"
        description="Bonus App controls established during onboarding: five masters, the effective palette and two font families."
        :percent="appPercent"
        :complete="appComplete"
        :locked="!consoleComplete"
        locked-title="Console identity is incomplete"
        locked-description="Complete Place, Kitchen and Console identity before editing App identity."
        :requirements="[]"
      >
        <ConsoleKitchenIdentitySectionsApp
          :kitchen-id="kitchenId"
          @saved="refreshTargets"
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
import { useKitchenInterface } from '../../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenSurface } from '../../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import ConsoleKitchenIdentitySectionsApp from './App.vue'

const {
  selectedKitchen,
  kitchenId,
  canWrite,
  place,
  placePending,
  placeRequirements,
  placePercent,
  placeComplete,
  rootRequirements,
  rootPercent,
  rootComplete,
  consoleRequirements,
  consolePercent,
  consoleComplete,
  appRequirements,
  appPercent,
  appComplete,
  hasDedicatedApp,
  refreshTargets,
} = useKitchenIdentityProgression()
const { preview, surface } = useKitchenInterface()
const kitchen = computed(
  () => selectedKitchen.value as KitchenSurface | null
)
const resolvedKitchen = computed(() => surface({
  kitchen: kitchen.value,
  place: place.value,
}))
const previewModel = computed(() => preview(resolvedKitchen.value))
</script>
