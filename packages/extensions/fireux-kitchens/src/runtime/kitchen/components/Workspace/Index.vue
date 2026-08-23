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

      <div v-else class="px-6 py-10 text-center">
        <div
          class="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <UIcon name="i-lucide-chef-hat" class="size-7" />
        </div>
        <h2 class="mt-4 text-lg font-semibold text-highlighted">
          No Kitchen yet
        </h2>
        <p class="mx-auto mt-2 max-w-lg text-sm text-muted">
          Create one above, then KitchenAI will help you build it as you work.
        </p>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceIndex } from '../../composables/workspace/index/useKitchenWorkspaceIndex'
import { useKitchenWorkspaceIndexEntry } from '../../composables/workspace/index/useKitchenWorkspaceIndexEntry'

const { current, actions } = useKitchenWorkspaceIndex()
const { clientReady, hasIdentity } = useKitchenWorkspaceIndexEntry(
  computed(() => current.value.id),
  true,
  actions.refresh
)
</script>
