<!-- packages/core/fireux-core/src/runtime/components/molecules/forms/firestore/ListActions.vue -->
<template>
  <div class="space-y-3">
    <div
      v-for="item in items"
      :key="item.id"
      class="flex items-center justify-between gap-3"
    >
      <component
        :is="item.to ? 'NuxtLink' : 'div'"
        v-bind="item.to ? { to: item.to } : {}"
        class="list-pill"
      >
        <UAvatar
          :src="item.avatar || undefined"
          :text="initialsFor(item)"
          :alt="item.title"
          size="sm"
          class="list-pill__avatar"
        />

        <div class="list-pill__text">
          <span class="list-pill__title">{{ item.title }}</span>
          <span v-if="item.subtitle" class="list-pill__subtitle">
            {{ item.subtitle }}
          </span>
        </div>
      </component>

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

type ActionHandler = (id: string) => void | Promise<unknown>
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

const initialsFor = (item: ListItem): string => {
  const base = (item.initials || item.title || '').trim()
  if (!base) return '·'
  if (base.length === 1) return base.toUpperCase()
  const parts = base.split(/\s+/).filter(Boolean)
  if (!parts.length) return base.charAt(0).toUpperCase()
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.at(-1)?.charAt(0) ?? ''
  return `${first}${last}`.toUpperCase()
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

<style scoped>
.list-pill {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  min-width: 0;
  text-decoration: none;
  color: inherit;
}

.list-pill__avatar {
  border-radius: 9999px;
  box-shadow: 0 0 0 1px var(--ui-border-accented) inset;
}

.list-pill__text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.list-pill__title {
  font-weight: 600;
  line-height: 1.1;
  display: block;
  max-width: 20rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-pill__subtitle {
  font-size: 0.75rem;
  color: var(--ui-text-muted);
  display: block;
  max-width: 20rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
