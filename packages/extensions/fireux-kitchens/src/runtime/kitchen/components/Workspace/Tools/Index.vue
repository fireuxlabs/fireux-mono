<template>
  <section aria-label="Kitchen tools">
    <div class="kitchen-workspace-tools">
      <Create
        v-if="kitchenTool?.kind === 'create'"
        class="kitchen-workspace-tools__slot"
        @created="setCurrent"
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
        :title="currentName"
        :subtitle="currentDescription"
        :image-url="currentImage"
        to="/workspace/kitchen/identity"
        link
        :show-badges="false"
        class="kitchen-workspace-tools__slot"
      />

      <UButton
        v-if="userTool"
        :label="userTool.label"
        icon="i-lucide-user-round-plus"
        color="neutral"
        variant="soft"
        to="/auth?redirect=/"
        class="kitchen-workspace-tools__slot"
      />
      <UserCardsPill
        v-else-if="userPill"
        v-bind="userPill"
        link
        :show-badges="false"
        class="kitchen-workspace-tools__slot"
      />
      <UButton
        label="Misebox"
        :aria-label="exploreAction.label"
        icon="i-lucide-globe-2"
        color="neutral"
        variant="outline"
        :to="exploreAction.to"
        class="kitchen-workspace-tools__slot"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenWorkspaceTools } from '../../../composables/workspace/index/useKitchenWorkspaceTools'
import Create from '../Create.vue'

const { isAuthenticated } = useAuth()
const { currentUser, pill: userInterface } = useUser()
const { currentId, currentName, currentDescription, currentImage, setCurrent } =
  useWorkspace('kitchen')
const { kitchenComplete, kitchenTool, userTool, exploreAction } =
  useKitchenWorkspaceTools()
const userPill = computed(() => {
  const user = currentUser.value
  if (!user) return null
  const card = userInterface(user)
  return card ? { ...card, to: '/dashboard/user-profile' } : null
})
</script>

<style scoped>
.kitchen-workspace-tools {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(var(--spacing) * 2);
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
