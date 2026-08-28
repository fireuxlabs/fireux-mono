<template>
  <section
    class="mx-auto grid min-h-28 w-full max-w-3xl gap-4"
    aria-label="Active Kitchen"
  >
    <WorkspaceKitchenActiveCard
      v-if="
        kitchenComplete && !showEmptyState && workspace.selection.kitchen.value
      "
      :kitchen="workspace.selection.kitchen.value"
      :show-kitchens-action="showKitchensAction"
      :kitchens-open="kitchensOpen"
      @toggle-kitchens="emit('toggle-kitchens')"
    />

    <WorkspaceKitchenCreate
      v-else-if="
        canCreateKitchen ||
        (workspace.selection.kitchen.value && !kitchenComplete)
      "
      launcher="inline"
      @created="createdKitchen"
      @manifested="manifestedKitchen"
    />

    <UAlert
      v-else-if="capacityConsumed"
      color="neutral"
      variant="subtle"
      title="Your Kitchen is already active"
      description="Business is required to create another Kitchen."
    >
      <template #actions>
        <UButton
          to="/pricing"
          label="View Business"
          color="neutral"
          variant="soft"
        />
      </template>
    </UAlert>

    <UAlert
      v-else
      color="neutral"
      variant="subtle"
      title="No Kitchen available"
      description="Your App has not granted access to a Kitchen."
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
import { computed, onMounted, ref, watch } from '#imports'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenWorkspace } from '../../composables/workspace/core/useKitchenWorkspace'
import { useKitchenWorkspaceMain } from '../../composables/workspace/main/useKitchenWorkspaceMain'

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
const {
  workspacePending,
  canCreateKitchen,
  capacityConsumed,
  kitchenComplete,
} = useKitchenWorkspaceMain(workspace)
const mounted = ref(false)
const showEmptyState = ref(false)

const canEmpty = computed(
  () => mounted.value && (isDeveloper.value || isAdmin.value)
)

onMounted(() => {
  mounted.value = true
})

function selectOnlyKitchen() {
  const kitchens = workspace.targets.kitchens.value
  const existing = kitchens[0]
  const existingId = String(existing?.id || '').trim()
  if (
    workspacePending.value ||
    workspace.selection.kitchenId.value ||
    kitchens.length !== 1 ||
    !existingId ||
    canCreateKitchen.value
  )
    return
  showEmptyState.value = false
  workspace.actions.selectKitchen(existingId)
}

watch(workspacePending, selectOnlyKitchen, { immediate: true })
watch(() => workspace.selection.kitchenId.value, selectOnlyKitchen)
watch(() => workspace.targets.kitchens.value, selectOnlyKitchen)

async function createdKitchen(id: string) {
  showEmptyState.value = false
  workspace.actions.selectKitchen(id)
  await workspace.targets.refresh()
}

async function manifestedKitchen(id: string) {
  showEmptyState.value = true
  workspace.actions.selectKitchen(id)
  await workspace.targets.refresh()
}

function emptyWorkspace() {
  showEmptyState.value = true
  workspace.actions.clearSelectedKitchen()
}
</script>
