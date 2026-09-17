<template>
  <WorkspaceKitchenAppearancePaletteEditor
    v-if="outcome === 'ready'"
    :key="kitchenId"
    :palette="palette"
    :debug-context="debugContext"
    :stored-palette="storedPalette"
    :can-write="canSave"
    :saving="saving"
    :save-state="saveState"
    :error="error"
    :name="place?.name || 'Your Kitchen'"
    :image-url="place?.logo_image || place?.image_url || ''"
    @save="save"
  />
  <MoleculesStateCard
    v-else
    entity="Kitchen"
    kind="document"
    :loading="outcome === 'pending' || outcome === 'idle'"
    :state="outcome === 'error' ? 'error' : 'missing'"
  />
  <ClientOnly v-if="outcome !== 'ready'">
    <DevDebugPanel
      object-origin="fetched"
      :objects="{ storedPalette }"
      :derived="debugContext"
      title="Appearance debug"
      class="mt-6"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useKitchenWorkspacePaletteEditor } from '../../../composables/workspace/appearance/useKitchenWorkspacePaletteEditor'
import { useKitchenWorkspacePlace } from '../../../composables/workspace/identity/useKitchenWorkspacePlace'
const { place, placeId, placeOutcome } = useKitchenWorkspacePlace()
const {
  kitchenId,
  outcome,
  palette,
  storedPalette,
  canSave,
  saving,
  saveState,
  error,
  save,
} = useKitchenWorkspacePaletteEditor()
const route = useRoute()
const debugContext = computed(() => ({
  route: route.path,
  kitchenId: kitchenId.value,
  placeId: placeId.value,
  reads: { kitchen: outcome.value, place: placeOutcome.value },
  paletteSource: storedPalette.value
    ? 'Kitchen.theme.palette'
    : 'default palette',
}))
</script>
