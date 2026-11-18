<template>
  <div v-if="outcome === 'ready'" class="workspace-surface">
    <KitchenAppearanceItemImages
      :key="`images-${kitchenId}`"
      :kitchen-id="kitchenId"
      :enabled="identity.selectedKitchen.value?.services?.item_images === true"
      :disabled="!canSave"
    />
    <KitchenAppearancePaletteEditor
      :key="kitchenId"
      :palette="palette"
      :kitchen-id="previewKitchenId"
      :debug-context="debugContext"
      :stored-palette="storedPalette"
      :can-write="canSave"
      :saving="saving"
      :save-state="saveState"
      :error="error"
      :preview-menus="previewMenus"
      :preview-outcome="menusOutcome"
      :name="place?.name || 'Your Kitchen'"
      :image-url="media.imageUrl"
      :image-fit="media.imageFit"
      :image-background="media.imageBackground"
      @save="save"
    />
  </div>
  <FireState
    v-else
    entity="Kitchen"
    :outcome="outcome === 'idle' ? 'pending' : outcome"
  />
  <ClientOnly v-if="outcome !== 'ready'">
    <FireDiagnosticsDebugPanel
      object-origin="fetched"
      :objects="{ storedPalette }"
      :derived="debugContext"
      title="Appearance debug"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenMenuCollection } from '../../../menu/composables/useKitchenMenuCollection'
import { placeIdentityMedia } from 'fireux-places/runtime/place/utils/place-identity-media'
import { useRoute } from '#imports'
import { useKitchenWorkspaceColours } from '../../composables/workspace/identity/useKitchenWorkspaceColours'
import { useKitchenWorkspaceIdentity } from '../../composables/workspace/useKitchenWorkspaceIdentity'
const identity = useKitchenWorkspaceIdentity()
const { place, placeId, placeOutcome } = identity
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
} = useKitchenWorkspaceColours()
const previewKitchenId = computed(() =>
  outcome.value === 'ready' &&
  identity.selectedKitchen.value?.id === kitchenId.value
    ? kitchenId.value
    : ''
)
const { activeMenus, outcome: menusOutcome } = useKitchenMenuCollection(
  previewKitchenId,
  {
    kitchenCollectionPath: 'kitchens',
    databaseId: readRuntimeFirestoreDatabaseId(),
  }
)
const previewMenus = computed(() => {
  if (menusOutcome.value !== 'ready') return []
  const named = activeMenus.value.filter((menu) => menu.name?.trim())
  const rank = (menu: (typeof named)[number]) =>
    menu.status === 'published' ? (menu.schedule === 'daily' ? 1 : 0) : 2
  return named
    .sort((a, b) => rank(a) - rank(b))
    .map((menu) => ({
      id: menu.id,
      name: menu.name.trim(),
      description: menu.description?.trim(),
      draft: menu.status === 'draft',
    }))
})

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
