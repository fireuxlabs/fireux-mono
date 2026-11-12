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
    <FireState v-if="pending" entity="kitchens" outcome="pending" />
    <UAlert
      v-else-if="error"
      title="Kitchens could not be loaded"
      description="Try again to see the latest Kitchens."
      color="error"
      variant="soft"
      role="alert"
      aria-live="assertive"
    >
      <template #actions>
        <FireCopyError
          message="Kitchens could not be loaded&#10;Try again to see the latest Kitchens."
        />
        <UButton label="Try again" variant="soft" @click="refresh()" />
      </template>
    </UAlert>
    <KitchenCollection v-else-if="kitchens.length" :kitchens="kitchens" />
    <UAlert
      v-else
      title="No Kitchens available yet"
      description="Kitchens will appear here when they are available to explore."
      color="neutral"
      variant="soft"
      role="status"
      aria-live="polite"
    />
  </DirectoryHome>
</template>
<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import DirectoryHome from 'fireux-ecosystem/runtime/components/landing/DirectoryHome.vue'
import { useKitchens } from 'fireux-kitchens/runtime/kitchen/composables/useKitchens'
const { workspaceEntryHref } = useWorkspaceEntryCta('kitchen')
const { collection: kitchens, pending, error, refresh } = useKitchens()
</script>
