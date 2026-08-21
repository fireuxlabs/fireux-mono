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

      <WorkspaceKitchenIdentityStage
        number="01"
        title="Your Place"
        description="Shared location identity inherited by this Kitchen. Change the backdrop here without duplicating it on Kitchen."
        :percent="placePercent"
        :complete="placeComplete"
        :requirements="placeRequirements"
      >
        <WorkspaceKitchenIdentityPlace />
      </WorkspaceKitchenIdentityStage>

      <WorkspaceKitchenIdentityStage
        number="02"
        title="Kitchen profile"
        description="Kitchen lifecycle, route and directory visibility. Identity remains on the linked Place."
        :percent="rootPercent"
        :complete="rootComplete"
        :locked="!placeComplete"
        locked-title="Place identity is incomplete"
        locked-description="Finish the linked Place identity before publishing this Kitchen."
        :requirements="rootRequirements"
      >
        <KitchenEditPublication
          :kitchen="kitchen"
          :kitchen-id="kitchenId"
          :can-write="canWrite"
        />
      </WorkspaceKitchenIdentityStage>

      <WorkspaceKitchenIdentityStage
        number="03"
        title="Workspace theme"
        description="Four functional colours and optional Workspace typography. This layer exists because the Kitchen has a Workspace."
        :percent="workspacePercent"
        :complete="workspaceComplete"
        :locked="!rootComplete"
        locked-title="Kitchen identity is incomplete"
        locked-description="Finish the Place and Kitchen sections before configuring the Workspace theme."
        :requirements="workspaceRequirements"
      >
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-palette"
          to="/workspace/kitchen/identity/theme"
        >
          Edit Workspace theme
        </UButton>
      </WorkspaceKitchenIdentityStage>

      <WorkspaceKitchenIdentityStage
        v-if="hasDedicatedApp"
        number="04"
        title="App identity"
        description="Bonus App controls established during onboarding: five masters, the effective palette and two font families."
        :percent="appPercent"
        :complete="appComplete"
        :locked="!workspaceComplete"
        locked-title="Workspace identity is incomplete"
        locked-description="Complete Place, Kitchen and Workspace identity before editing App identity."
        :requirements="[]"
      >
        <WorkspaceKitchenIdentitySectionsApp
          :kitchen-id="kitchenId"
          @saved="refreshTargets"
        />
      </WorkspaceKitchenIdentityStage>
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
import { useKitchenIdentityProgression } from '../../../../composables/workspace/identity/useKitchenIdentityProgression'
import { useKitchenInterface } from '../../../../composables/firestore/utils/view/useKitchenInterface'
import type { KitchenSurface } from '../../../../composables/firestore/utils/view/useKitchenInterface'
import WorkspaceKitchenIdentitySectionsApp from './App.vue'

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
  workspaceRequirements,
  workspacePercent,
  workspaceComplete,
  appRequirements,
  appPercent,
  appComplete,
  hasDedicatedApp,
  refreshTargets,
} = useKitchenIdentityProgression()
const { preview, surface } = useKitchenInterface()
const kitchen = computed(() => selectedKitchen.value as KitchenSurface | null)
const resolvedKitchen = computed(() =>
  surface({
    kitchen: kitchen.value,
    place: place.value,
  })
)
const previewModel = computed(() => preview(resolvedKitchen.value))
</script>
