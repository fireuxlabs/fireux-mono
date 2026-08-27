<template>
  <section
    class="mx-auto grid min-h-28 w-full max-w-3xl gap-4"
    aria-label="Active Kitchen"
  >
    <USkeleton
      v-if="isResolving"
      class="h-28 rounded-xl"
      aria-label="Loading active Kitchen"
    />

    <WorkspaceKitchenIndexActive
      v-else-if="!showEmptyState && workspace.selection.kitchen.value"
      :kitchen="workspace.selection.kitchen.value"
      :show-kitchens-action="showKitchensAction"
      :kitchens-open="kitchensOpen"
      @toggle-kitchens="emit('toggle-kitchens')"
    />

    <WorkspaceKitchenCreate
      v-else-if="workspace.targets.outcome.value !== 'error'"
      launcher="inline"
      @created="createdKitchen"
    />

    <div
      v-if="canEmpty && workspace.selection.kitchen.value"
      class="flex justify-end"
    >
      <UButton
        label="Empty"
        color="neutral"
        variant="ghost"
        size="xs"
        icon="i-lucide-circle-dashed"
        @click="emptyWorkspace"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from '#imports'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenWorkspace } from 'fireux-kitchens/runtime/kitchen/composables/workspace/core/useKitchenWorkspace'

withDefaults(
  defineProps<{
    showKitchensAction?: boolean
    kitchensOpen?: boolean
  }>(),
  {
    showKitchensAction: false,
    kitchensOpen: false,
  }
)
const emit = defineEmits<{
  (event: 'toggle-kitchens'): void
}>()

const { isAdmin, isDeveloper } = useUser()
const workspace = useKitchenWorkspace()
const mounted = ref(false)
const showEmptyState = ref(false)
const isResolving = computed(
  () =>
    !mounted.value ||
    workspace.targets.outcome.value === 'idle' ||
    workspace.targets.pending.value
)

const canEmpty = computed(
  () => mounted.value && (isDeveloper.value || isAdmin.value)
)

onMounted(() => {
  mounted.value = true
})

async function createdKitchen(id: string) {
  showEmptyState.value = false
  workspace.actions.selectKitchen(id)
  await workspace.targets.refresh()
}

function emptyWorkspace() {
  showEmptyState.value = true
  workspace.actions.clearSelectedKitchen()
}
</script>
