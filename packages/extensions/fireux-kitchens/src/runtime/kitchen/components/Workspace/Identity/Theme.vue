<template>
  <ClientOnly>
    <div v-if="selectedKitchen && !placePending && rootComplete" class="space-y-6">
      <UCard variant="subtle">
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-palette"
            class="mt-1 size-5 shrink-0 text-muted"
          />
          <div>
            <h2 class="text-2xl font-semibold text-highlighted">
              Menu Display
            </h2>
            <p class="text-sm text-dimmed">
              Portable food-menu styling for this kitchen. Tenant app chrome
              stays app-owned.
            </p>

            <div
              v-if="previewMenus.length"
              class="mt-3 flex flex-wrap items-center gap-2"
            >
              <span class="text-xs font-medium text-dimmed">
                Preview menu
              </span>
              <UButton
                v-for="menu in previewMenus"
                :key="menu.id"
                size="xs"
                color="neutral"
                :variant="previewMenuId === menu.id ? 'solid' : 'soft'"
                @click="selectPreviewMenu(menu.id)"
              >
                {{ menu.name || menu.id }}
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div class="space-y-4">
          <WorkspaceKitchenIdentityWorkspacePaletteEditor
            :palette="workspacePalette"
            :can-write="canWriteWorkspacePalette"
            :saving="paletteSaving"
            :save-state="paletteSaveState"
            @save="saveWorkspacePalette"
          />
          <WorkspaceKitchenIdentityThemeEditor
            :style="draftPageStyle"
            :can-write="canWrite"
            :save-state="saveState"
            @update:style="setDraftPageStyle"
          />
        </div>

        <WorkspaceKitchenIdentityMenuPreview
          :kitchen-name="kitchenName"
          :menu="previewMenu"
          :sections="previewSections"
          :page-style="draftPageStyle"
          :menu-url="menuUrl"
        />
      </div>
    </div>

    <UCard v-else-if="selectedKitchen && !placePending">
      <UAlert
        color="neutral"
        variant="subtle"
        icon="i-lucide-lock-keyhole"
        title="Complete Kitchen identity first"
        description="Workspace theme unlocks when the Place and Kitchen identity sections are complete."
      >
        <template #actions>
          <UButton to="/workspace/kitchen/identity" color="neutral" variant="soft">
            Return to identity
          </UButton>
        </template>
      </UAlert>
    </UCard>

    <MoleculesStateCard v-else entity="kitchen theme" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useKitchenThemeEditor } from './useKitchenThemeEditor'
import { useKitchenWorkspacePaletteEditor } from './useKitchenWorkspacePaletteEditor'
import { useKitchenIdentityProgression } from '../../../composables/workspace/identity/useKitchenIdentityProgression'
const { rootComplete, placePending } = useKitchenIdentityProgression()
const {
  selectedKitchen,
  kitchenId,
  dataType,
  canWrite,
  refreshTargets,
  requireWritableData,
  menus,
  toast,
  fireux,
  kitchen,
  normalizeString,
  kitchenAppId,
  normalizePageStyle,
  pageStyleEquals,
  themeWriteStyle,
  kitchenName,
  kitchenSlug,
  selectedPreviewMenuId,
  previewMenus,
  fallbackPreviewMenu,
  previewMenu,
  previewMenuId,
  isLiveData,
  canWriteTheme,
  livePreviewMenuId,
  previewMenuRouteScope,
  previewMenuDetail,
  previewSections,
  menuUrl,
  pageStyle,
  locallySavedPageStyle,
  storedPageStyle,
  draftPageStyle,
  saving,
  saveState,
  activeThemeTarget,
  targetDrafts,
  queuedThemeSave,
  pendingThemeSaves,
  inFlightThemeSave,
  saveTimer,
  setDraftPageStyle,
  selectPreviewMenu,
  queueThemeSave,
  flushQueuedThemeSave,
  discardQueuedThemeSave,
  isActiveThemeTarget,
  hasNewerThemeSave,
  hasOutstandingThemeSave,
  flushThemeSave,
} = useKitchenThemeEditor()
const {
  palette: workspacePalette,
  canSave: canWriteWorkspacePalette,
  saving: paletteSaving,
  saveState: paletteSaveState,
  save: saveWorkspacePalette,
} = useKitchenWorkspacePaletteEditor()
</script>
