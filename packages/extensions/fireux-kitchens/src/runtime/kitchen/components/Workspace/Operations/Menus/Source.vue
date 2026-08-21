<template>
  <section class="workspace-surface">
    <WorkspaceKitchenOperationsMenusWorkspaceHeader current-label="Source" />

    <UCard v-if="source && !menu">
      <template #header>
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-highlighted">
            Process {{ sourceLabel }}
          </h2>
          <p class="text-sm text-dimmed">
            Convert this saved source into a review draft.
          </p>
        </div>
      </template>

      <WorkspaceKitchenOperationsMenusProcess />
    </UCard>

    <UCard v-else-if="menu || source">
      <template #header>
        <div class="space-y-1">
          <h2 class="text-base font-semibold text-highlighted">
            Source document and AI processing
          </h2>
          <p class="text-sm text-dimmed">
            Keep the original source separate from the published Menu.
          </p>
        </div>
      </template>

      <div class="space-y-6">
        <section v-if="menu" class="space-y-3">
          <WorkspaceKitchenOperationsMenusCreationUpload
            :upload-id="menuId"
            :lock-slug="true"
            :replace-existing="true"
            title="Upload source document"
            description="Attach the original files before comparing processed output with this Menu."
            cta-label="Upload source"
          />
        </section>

        <MoleculesDisclosurePanel
          title="Processing tools"
          :default-open="false"
        >
          <div class="mt-4">
            <WorkspaceKitchenOperationsMenusProcess />
          </div>
        </MoleculesDisclosurePanel>
      </div>
    </UCard>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No Menu source"
      description="Choose a Menu or source from the Menus index."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceMenu } from '../../../../composables/workspace/operations/Menus/useKitchenWorkspaceMenu'

const { menu, menuId, source } = useKitchenWorkspaceMenu()
const sourceLabel = computed(() =>
  String(source.value?.source_url ? 'menu URL' : 'menu source')
)
</script>
