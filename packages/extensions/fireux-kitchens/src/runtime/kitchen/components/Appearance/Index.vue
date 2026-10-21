<template>
  <KitchenAppearancePaletteEditor
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
    :image-url="media.imageUrl"
    :image-fit="media.imageFit"
    :image-background="media.imageBackground"
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
    <DiagnosticsDebugPanel
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
import { placeIdentityMedia } from 'fireux-places/runtime/place/utils/place-identity-media'
import { useRoute } from '#imports'
import { useKitchenWorkspacePaletteEditor } from '../../composables/workspace/appearance/useKitchenWorkspacePaletteEditor'
import { useKitchenWorkspacePlace } from '../../composables/workspace/identity/useKitchenWorkspacePlace'
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
const media = computed(() => placeIdentityMedia(place.value))
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
