<template>
  <section
    class="mx-auto grid min-h-28 w-full max-w-3xl gap-4"
    aria-label="Active Kitchen"
  >
    <WorkspaceKitchenActiveCard
      v-if="!showEmptyState && workspace.selection.kitchen.value"
      :kitchen="workspace.selection.kitchen.value"
      :show-kitchens-action="showKitchensAction"
      :kitchens-open="kitchensOpen"
      @toggle-kitchens="emit('toggle-kitchens')"
    />

    <WorkspaceKitchenCreate
      v-else-if="canCreateKitchen || manifestingActiveKitchen"
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
const manifestingKitchenId = ref('')
const manifestingActiveKitchen = computed(
  () =>
    Boolean(manifestingKitchenId.value) &&
    manifestingKitchenId.value === workspace.selection.kitchenId.value &&
    !kitchenComplete.value
)

const canEmpty = computed(
  () => mounted.value && (isDeveloper.value || isAdmin.value)
)

onMounted(() => {
  mounted.value = true
})

watch(
  [
    workspacePending,
    () => workspace.selection.kitchenId.value,
    () => workspace.targets.kitchens.value,
  ],
  ([pending, activeId, kitchens]) => {
    const existing = kitchens[0]
    if (pending || activeId || !existing || canCreateKitchen.value) return
    showEmptyState.value = false
    workspace.actions.selectKitchen(existing.id)
  },
  { immediate: true }
)

async function createdKitchen(id: string) {
  manifestingKitchenId.value = ''
  showEmptyState.value = false
  workspace.actions.selectKitchen(id)
  await workspace.targets.refresh()
}

async function manifestedKitchen(id: string) {
  manifestingKitchenId.value = id
  showEmptyState.value = true
  workspace.actions.selectKitchen(id)
  await workspace.targets.refresh()
}

function emptyWorkspace() {
  showEmptyState.value = true
  workspace.actions.clearSelectedKitchen()
}
</script>
