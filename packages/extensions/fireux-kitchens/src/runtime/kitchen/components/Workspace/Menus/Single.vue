<template>
  <p v-if="derived.status === 'loading'" role="status" class="fx-type-body">
    Loading Menu…
  </p>
  <p v-else-if="derived.status === 'error'" class="fx-type-body">
    The selected Menu is unavailable.
  </p>
  <template v-else>
    <MenuProfile
      v-if="selectedMenu"
      :menu="selectedMenu"
      :kitchen-slug="selectedKitchen?.slug"
    >
      <template #footer>
        <div class="workspace-panel-actions">
          <UButton
            :to="`${selectedPath}/content`"
            icon="i-lucide-list-tree"
            label="Items & prices"
            size="sm"
          />
          <UButton
            :to="`${selectedPath}/publishing`"
            icon="i-lucide-globe"
            label="Publishing"
            color="neutral"
            variant="soft"
            size="sm"
          />
          <UButton
            :to="selectedPath"
            label="Menu settings"
            icon="i-lucide-settings-2"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </div>
        <p v-if="!canWrite" class="fx-type-caption mt-3">
          Editing requires access to this kitchen.
        </p>
      </template>
    </MenuProfile>
    <p v-else class="fx-type-caption">Choose a Menu from the collection.</p>
  </template>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import MenuProfile from './Cards/Profile.vue'
import { useKitchenMenusContext } from '../../../composables/workspace/menus/useKitchenMenusContext'
const { selectedMenu, selectedKitchen, canWrite, derived } =
  useKitchenMenusContext()
const selectedPath = computed(
  () =>
    `/workspace/kitchen/menus/${encodeURIComponent(selectedMenu.value?.id || '')}`
)
</script>
