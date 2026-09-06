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
        title="Place"
        description="The same-id Place owns venue presentation. A physical address is optional."
        :percent="placePercent"
        :complete="placeComplete"
        :requirements="placeRequirements"
      >
        <WorkspaceKitchenIdentityPlace />
      </WorkspaceKitchenIdentityStage>

      <KitchenEditPublication
        :kitchen="kitchen"
        :kitchen-id="kitchenId"
        :can-write="canWrite"
      />

      <WorkspaceKitchenIdentityStage
        number="02"
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
    </div>

    <UAlert v-else-if="!kitchenId" title="No Kitchen selected" />
    <UAlert
      v-else-if="outcome === 'error'"
      color="error"
      title="Kitchen identity unavailable"
      description="The selected Kitchen could not be loaded."
    />
    <UAlert
      v-else-if="outcome === 'missing'"
      title="Kitchen unavailable"
      description="Choose an available workspace to continue."
    />
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

const {
  selectedKitchen,
  outcome,
  kitchenId,
  canWrite,
  place,
  placePending,
  placeRequirements,
  placePercent,
  placeComplete,
  rootComplete,
  workspaceRequirements,
  workspacePercent,
  workspaceComplete,
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
