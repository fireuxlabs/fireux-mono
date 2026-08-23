<template>
  <section aria-label="Kitchen tools">
    <div class="flex flex-wrap items-center justify-end gap-2">
      <Create
        v-if="!currentId"
        class="mr-auto shrink-0"
        @created="setCurrent"
      />
      <UButton
        v-else-if="kitchenTool?.kind === 'complete'"
        :label="kitchenTool.label"
        icon="i-lucide-chef-hat"
        color="primary"
        to="/workspace/kitchen/identity"
        class="mr-auto"
      />
      <KitchenCardsPill
        v-else-if="kitchenComplete"
        :title="currentName"
        :subtitle="currentDescription"
        :image-url="currentImage"
        to="/workspace/kitchen/identity"
        link
        :show-badges="false"
        class="mr-auto"
      />

      <UButton
        v-if="userTool"
        :label="userTool.label"
        icon="i-lucide-user-round-plus"
        color="neutral"
        variant="soft"
        to="/auth?redirect=/"
      />
      <UserCardsPill
        v-else-if="userPill"
        v-bind="userPill"
        link
        :show-badges="false"
      />
      <UButton
        :label="exploreAction.label"
        icon="i-lucide-globe-2"
        color="neutral"
        variant="outline"
        :to="exploreAction.to"
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
