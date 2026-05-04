<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Team overview</div>
        <p class="console-card-header__description">
          Read-only view of who can work in the kitchen.
        </p>
      </div>
    </template>

    <div v-if="sortedMembers.length" class="space-y-2">
      <div
        v-for="member in sortedMembers"
        :key="member.id"
        class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-highlighted">
            {{ memberDisplayName(member) }}
          </p>
          <p class="truncate text-xs text-dimmed">
            {{ memberRole(member) || 'Missing role' }}
            <span v-if="memberStations(member)"> · {{ memberStations(member) }}</span>
          </p>
        </div>

        <UBadge size="xs" variant="soft" :color="activeColor(member)">
          {{ activeLabel(member) }}
        </UBadge>
      </div>
    </div>

    <p v-else class="text-sm text-dimmed">
      No team overview available.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenTeamMember } from '../../../../models/kitchen-team.model'

const props = withDefaults(
  defineProps<{
    collection?: KitchenTeamMember[]
  }>(),
  {
    collection: () => [],
  }
)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const memberName = (member: KitchenTeamMember) => normalizeString(member.name)
const memberDisplayName = (member: KitchenTeamMember) =>
  memberName(member) || 'Missing team member name'
const memberRole = (member: KitchenTeamMember) => normalizeString(member.role)
const memberStations = (member: KitchenTeamMember) =>
  Array.isArray(member.station_ids)
    ? member.station_ids.map((value) => normalizeString(value)).filter(Boolean).join(', ')
    : ''
const activeValue = (member: KitchenTeamMember) =>
  (member as Record<string, unknown>).active
const activeLabel = (member: KitchenTeamMember) => {
  const value = activeValue(member)
  if (value === true) return 'Active'
  if (value === false) return 'Inactive'
  return 'Missing active state'
}
const activeColor = (member: KitchenTeamMember) => {
  const value = activeValue(member)
  if (value === true) return 'primary'
  if (value === false) return 'neutral'
  return 'error'
}
const sortOrder = (member: KitchenTeamMember) => {
  const value = Number(member.sort_order)
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}
const sortedMembers = computed(() =>
  [...props.collection].sort((left, right) => {
    const byOrder = sortOrder(left) - sortOrder(right)
    if (byOrder) return byOrder

    const byName = memberDisplayName(left).localeCompare(memberDisplayName(right))
    if (byName) return byName

    return normalizeString(left.id).localeCompare(normalizeString(right.id))
  })
)
</script>
