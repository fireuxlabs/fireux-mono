<template>
  <DirectoryHome
    eyebrow="Misebox"
    title="Discover your next favourite Kitchen"
    description="Find Kitchens, explore their Menus and see what is cooking."
    icon="i-lucide-chef-hat"
    workspace-title="Your Kitchen, organised"
    workspace-description="Manage your Kitchen, Menus and Team in one Workspace."
    :workspace-to="workspaceEntryHref"
  >
    <FireStateCard
      v-if="pending"
      state="loading"
      entity="kitchens"
      surface="collection"
    />
    <FireStateCard
      v-else-if="error"
      state="error"
      title="Kitchens could not be loaded"
      description="Try again to see the latest Kitchens."
      surface="collection"
    >
      <template #actions
        ><UButton label="Try again" variant="soft" @click="refresh()"
      /></template>
    </FireStateCard>
    <KitchenCollection v-else-if="kitchens.length" :kitchens="kitchens" />
    <FireStateCard
      v-else
      state="empty"
      title="No Kitchens available yet"
      description="Kitchens will appear here when they are available to explore."
      surface="collection"
    />
  </DirectoryHome>
</template>
<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import DirectoryHome from 'fireux-core/runtime/components/landing/DirectoryHome.vue'
import { useKitchenCollection } from 'fireux-kitchens/runtime/kitchen/composables/useKitchenCollection'
const { workspaceEntryHref } = useWorkspaceEntryCta('kitchen')
const { collection: kitchens, pending, error, refresh } = useKitchenCollection()
</script>
