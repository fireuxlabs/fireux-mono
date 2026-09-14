<template>
  <WorkspaceKitchenIdentityWorkspacePaletteEditor
    v-if="outcome === 'ready'"
    :key="kitchenId"
    :palette="palette"
    :can-write="canSave"
    :saving="saving"
    :save-state="saveState"
    @save="save"
  />
  <MoleculesStateCard v-else entity="Kitchen" kind="document" :loading="outcome === 'pending' || outcome === 'idle'" />
</template>

<script setup lang="ts">
import { useKitchenWorkspacePaletteEditor } from './useKitchenWorkspacePaletteEditor'
const { kitchenId, outcome, palette, canSave, saving, saveState, save } =
  useKitchenWorkspacePaletteEditor()
</script>
