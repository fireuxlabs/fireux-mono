<template>
  <UPageCard
    title="Team"
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
          Can see/select
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
          Can write/operate
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
          Unique people
        </p>
      </div>
    </div>

    <div class="mt-4 space-y-3">
      <div>
        <p class="text-sm font-medium text-highlighted">
          Team IDs
        </p>
        <div v-if="teamIds.length" class="mt-2 flex flex-wrap gap-2">
          <UBadge
            v-for="id in teamIds"
            :key="id"
            color="neutral"
            variant="soft"
          >
            {{ id }}
          </UBadge>
        </div>
        <p v-else class="mt-1 text-sm text-dimmed">
          No team ids on this target yet.
        </p>
      </div>

      <div>
        <p class="text-sm font-medium text-highlighted">
          Operator IDs
        </p>
        <div v-if="operatorIds.length" class="mt-2 flex flex-wrap gap-2">
          <UBadge
            v-for="id in operatorIds"
            :key="id"
            color="primary"
            variant="soft"
          >
            {{ id }}
          </UBadge>
        </div>
        <p v-else class="mt-1 text-sm text-dimmed">
          No operator ids on this target yet.
        </p>
      </div>
    </div>

    <template #footer>
      <p class="text-xs text-dimmed">
        Team ids allow console selection. Operator ids allow writes.
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
}>(), {
  entityLabel: 'Target',
  targetId: '',
  teamIds: () => [],
  operatorIds: () => [],
  accessIds: () => [],
})

const description = computed(() => {
  const target = props.targetId
    ? `${props.entityLabel} ${props.targetId}`
    : `Selected ${props.entityLabel.toLowerCase()}`

  return `${target} team and operator membership.`
})
</script>
