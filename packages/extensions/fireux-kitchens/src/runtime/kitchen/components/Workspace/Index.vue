<template>
  <section class="workspace-surface workspace-surface--compact">
    <template v-if="clientReady && hasIdentity">
      <UCard v-if="current.outcome === 'pending' || current.outcome === 'idle'">
        <div class="flex items-center gap-3 text-sm text-muted">
          <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
          Loading your Kitchen
        </div>
      </UCard>

      <UAlert
        v-else-if="current.outcome === 'error'"
        color="error"
        variant="subtle"
        icon="i-lucide-triangle-alert"
        title="Your Kitchen could not be loaded"
        description="Try the request again."
      >
        <template #actions>
          <UButton
            label="Try again"
            color="error"
            variant="soft"
            size="sm"
            @click="actions.refresh"
          />
        </template>
      </UAlert>

      <WorkspaceKitchenIndexSelected
        v-else-if="current.kitchen"
        :kitchen="current.kitchen"
      />

      <UCard v-else>
        <div class="space-y-4">
          <div class="space-y-1">
            <h2 class="font-semibold text-highlighted">Create your Kitchen</h2>
            <p class="text-sm text-muted">
              Start with a name or find the Place your Kitchen belongs to.
            </p>
          </div>
          <WorkspaceKitchenCreate
            v-if="access.canCreate"
            @created="useCreatedKitchen"
          />
        </div>
      </UCard>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceIndex } from '../../composables/workspace/index/useKitchenWorkspaceIndex'
import { useKitchenWorkspaceIndexEntry } from '../../composables/workspace/index/useKitchenWorkspaceIndexEntry'

const { current, access, actions } = useKitchenWorkspaceIndex()
const { clientReady, hasIdentity } = useKitchenWorkspaceIndexEntry(
  computed(() => current.value.id),
  true,
  actions.refresh
)

async function useCreatedKitchen(id: string) {
  actions.setCurrent(id)
  await actions.refresh()
}
</script>
