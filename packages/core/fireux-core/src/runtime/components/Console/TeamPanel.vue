<template>
  <UPageCard
    title="Access"
    :description="description"
    variant="subtle"
  >
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-lg border border-default p-3">
        <p class="text-xs uppercase tracking-wide text-dimmed">
          Team
        </p>
        <p class="text-2xl font-semibold text-highlighted">
          {{ teamIds.length }}
        </p>
        <p class="text-xs text-dimmed">
          Can see and select
        </p>
      </div>

      <div class="rounded-lg border border-default p-3">
        <p class="text-xs uppercase tracking-wide text-dimmed">
          Operators
        </p>
        <p class="text-2xl font-semibold text-highlighted">
          {{ operatorIds.length }}
        </p>
        <p class="text-xs text-dimmed">
          Can write and operate
        </p>
      </div>

      <div class="rounded-lg border border-default p-3">
        <p class="text-xs uppercase tracking-wide text-dimmed">
          Access
        </p>
        <p class="text-2xl font-semibold text-highlighted">
          {{ accessIds.length }}
        </p>
        <p class="text-xs text-dimmed">
          Unique access ids
        </p>
      </div>
    </div>

    <UAlert
      class="mt-4"
      color="neutral"
      variant="soft"
      icon="i-lucide-shield-check"
      :title="accessTitle"
      :description="accessDescription"
    />

    <template #footer>
      <p class="text-xs text-dimmed">
        Team ids allow console selection. Operator ids allow writes. Raw ids stay in debug.
      </p>
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  entityLabel?: string
  targetId?: string
  teamIds?: string[]
  operatorIds?: string[]
  accessIds?: string[]
  readOnly?: boolean
  canWrite?: boolean
}>(), {
  entityLabel: 'Target',
  targetId: '',
  teamIds: () => [],
  operatorIds: () => [],
  accessIds: () => [],
  readOnly: false,
  canWrite: false,
})

const description = computed(() => {
  const target = props.targetId
    ? `${props.entityLabel} ${props.targetId}`
    : `Selected ${props.entityLabel.toLowerCase()}`

  return `${target} access and operator membership.`
})

const accessTitle = computed(() => {
  if (props.canWrite) return 'Write access enabled'
  if (props.readOnly) return 'Read-only target'
  return 'Write access disabled'
})

const accessDescription = computed(() => {
  if (props.canWrite) {
    return `${props.entityLabel} operators can update this selected target.`
  }

  if (props.readOnly) {
    return `${props.entityLabel} can be inspected, but changes are disabled.`
  }

  return `${props.entityLabel} can be selected here, but this user cannot write to it.`
})
</script>
