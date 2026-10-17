<template>
  <section class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
    <UBreadcrumb
      :items="[
        { label: 'Kitchen', to: workspaceEntryPath },
        { label: 'Settings' },
      ]"
      :ui="{ list: 'flex-wrap' }"
    />
    <p class="text-sm text-muted">
      Manage your venue, opening hours, appearance and connections.
    </p>
    <div
      aria-label="Settings pages"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <UPageCard
        v-for="item in children"
        :key="item.to"
        :title="item.label"
        :to="item.to"
        :icon="item.icon"
      />
    </div>
    <p class="text-sm text-muted">
      Access controls are not connected yet. Existing account and Kitchen
      permissions still apply.
    </p>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from 'fireux-core/runtime/composables/navigation/useNav'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const navigation = useNav(['workspace'])
const children = computed(
  () =>
    navigation.items.value.find(
      (item) => item.key === 'workspace-kitchen-settings'
    )?.children || []
)
</script>
