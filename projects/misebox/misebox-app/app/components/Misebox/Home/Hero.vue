<template>
  <WorkspaceHero
    title="Restaurant menu and Kitchen management workspace"
    :description="introduction"
  >
    <template v-if="!complete" #links>
      <UButton
        to="/tools"
        label="Browse restaurant tools"
        color="neutral"
        variant="soft"
        trailing-icon="i-lucide-arrow-right"
      />
    </template>
  </WorkspaceHero>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenWorkspaceTools } from 'fireux-kitchens/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceTools'

const { appAccess } = useUser()
const { kitchenComplete: complete } = useKitchenWorkspaceTools()
const introductions = {
  free: 'Start one Kitchen and publish one restaurant Menu for free. No sign-up required.',
  premium: 'Manage your Kitchen and publish multiple Menus.',
  business: 'Manage multiple Kitchens, Menus and teams.',
} as const
const introduction = computed(() => introductions[appAccess.value.subscription])
</script>
