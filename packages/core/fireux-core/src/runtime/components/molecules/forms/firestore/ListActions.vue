<!-- packages/core/fireux-core/src/runtime/components/molecules/forms/firestore/ListActions.vue -->
<template>
  <div class="space-y-3">
    <div
      v-for="item in items"
      :key="item.id"
      class="flex items-center justify-between gap-3"
    >
      <MoleculesPill
        :avatar="item.avatar ?? undefined"
        :initials="item.initials ?? undefined"
        :title="item.title"
        :subtitle="item.subtitle ?? ''"
        :to="item.to ?? undefined"
      />

      <div class="flex items-center gap-2">
        <template v-if="actionApprove || actionReject">
          <UButton
            v-if="actionApprove"
            type="button"
            size="xs"
            color="primary"
            icon="i-lucide-check"
            :aria-label="approveLabel"
            :title="approveLabel"
            :loading="isBusy(item.id)"
            :disabled="isBusy(item.id)"
            @click="() => handleApprove(item.id)"
          />

          <UButton
            v-if="actionReject"
            type="button"
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-x"
            :aria-label="rejectLabel"
            :title="rejectLabel"
            :loading="isBusy(item.id)"
            :disabled="isBusy(item.id)"
            @click="() => handleReject(item.id)"
          />
        </template>

        <template v-else-if="actionToggle && getToggleState">
          <USwitch
            :model-value="safeToggleState(item.id)"
            :disabled="isBusy(item.id)"
            :aria-label="toggleLabel"
            :title="toggleLabel"
            @update:model-value="handleToggle(item.id, Boolean($event))"
          />
        </template>
      </div>
    </div>

    <div v-if="!items?.length" class="text-sm text-gray-500">
      {{ emptyText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs, type Ref } from 'vue'
/**
 * Generic pill list with optional actions.
 * Supports approve/reject buttons or a boolean toggle per item.
 */
type ListItem = {
  id: string
  title: string
  subtitle?: string | null
  avatar?: string | null
  initials?: string | null
  to?: string | null
}

type ActionHandler = (id: string) => void | Promise<void>
type ToggleGetter = (id: string) => boolean
type ToggleHandler = (id: string, next: boolean) => void | Promise<void>

const props = withDefaults(
  defineProps<{
    items: ListItem[]
    actionApprove?: ActionHandler
    actionReject?: ActionHandler
    approveLabel?: string
    rejectLabel?: string
    getToggleState?: ToggleGetter
    actionToggle?: ToggleHandler
    toggleLabel?: string
    emptyText?: string
  }>(),
  {
    items: () => [],
    approveLabel: 'Approve',
    rejectLabel: 'Reject',
    toggleLabel: 'Toggle',
    emptyText: 'Nothing to review.',
  }
)

// Expose props for template usage
const {
  items,
  actionApprove,
  actionReject,
  approveLabel,
  rejectLabel,
  getToggleState,
  actionToggle,
  toggleLabel,
  emptyText,
} = toRefs(props)

const busyMap = reactive<Record<string, boolean>>({})

const isBusy = (id: string) => Boolean(busyMap[id])

const safeToggleState = (id: string) => {
  const getter = getToggleState.value
  if (!getter) return false
  try {
    return Boolean(getter(id))
  } catch {
    return false
  }
}

async function runAction(action: Ref<ActionHandler | undefined>, id: string) {
  const fn = action.value
  if (!fn || isBusy(id)) return
  busyMap[id] = true
  try {
    await fn(id)
  } finally {
    delete busyMap[id]
  }
}

async function runToggle(
  action: Ref<ToggleHandler | undefined>,
  id: string,
  next: boolean
) {
  const fn = action.value
  if (!fn || isBusy(id)) return
  busyMap[id] = true
  try {
    await fn(id, next)
  } finally {
    delete busyMap[id]
  }
}

const handleApprove = (id: string) => runAction(actionApprove, id)
const handleReject = (id: string) => runAction(actionReject, id)
const handleToggle = (id: string, next: boolean) =>
  runToggle(actionToggle, id, next)

defineOptions({ name: 'MoleculesFormsFirestoreListActions' })
</script>
