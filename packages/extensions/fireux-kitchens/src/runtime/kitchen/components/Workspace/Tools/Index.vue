<template>
  <section aria-label="Kitchen tools">
    <div class="kitchen-workspace-tools">
      <USkeleton
        v-if="workspacePending"
        class="h-9 w-full rounded-lg"
        aria-label="Loading Kitchen access"
      />
      <Create
        v-else-if="kitchenTool?.kind === 'create'"
        class="kitchen-workspace-tools__slot"
        @created="activate"
      />
      <UButton
        v-else-if="kitchenTool?.kind === 'complete'"
        :label="kitchenTool.label"
        icon="i-lucide-chef-hat"
        color="primary"
        to="/workspace/kitchen/identity"
        class="kitchen-workspace-tools__slot"
      />
      <KitchenCardsPill
        v-else-if="kitchenComplete"
        :title="activeName"
        :subtitle="activeDescription"
        :image-url="activeImage"
        to="/workspace/kitchen/identity"
        link
        :show-badges="false"
        class="kitchen-workspace-tools__slot"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useKitchenWorkspace } from '../../../composables/workspace/core/useKitchenWorkspace'
import { useKitchenWorkspaceTools } from '../../../composables/workspace/index/useKitchenWorkspaceTools'
import Create from '../Create.vue'

const workspace = useKitchenWorkspace()
const {
  activeName,
  activeDescription,
  activeImage,
  workspacePending,
  kitchenComplete,
  kitchenTool,
} = useKitchenWorkspaceTools(workspace)
const activate = workspace.actions.selectKitchen
</script>

<style scoped>
.kitchen-workspace-tools {
  display: flex;
}

.kitchen-workspace-tools__slot {
  min-width: 0;
  width: 100%;
}

@media (max-width: 40rem) {
  .kitchen-workspace-tools {
    gap: var(--spacing);
  }

  .kitchen-workspace-tools :deep(button),
  .kitchen-workspace-tools :deep(a) {
    justify-content: center;
    min-width: 0;
    padding-inline: calc(var(--spacing) * 2);
    font-size: var(--text-xs);
  }
}
</style>
