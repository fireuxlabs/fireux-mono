<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <UBadge variant="soft">{{ sortedMembers.length }}</UBadge>
      </div>
    </template>

    <div v-if="sortedMembers.length" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="member in sortedMembers"
        :key="member.id"
        class="rounded-lg border border-default bg-elevated/30 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 space-y-1">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-user-round" class="size-4 text-dimmed" />
              <h3 class="truncate text-sm font-semibold text-highlighted">
                {{ memberDisplayName(member) }}
              </h3>
            </div>

            <UBadge
              v-if="hasMissingName(member)"
              color="error"
              variant="soft"
              size="xs"
            >
              Missing name
            </UBadge>

            <p class="text-sm text-dimmed">
              {{ memberRole(member) || 'Missing role' }}
            </p>

            <p v-if="memberStations(member)" class="text-xs text-dimmed">
              {{ memberStations(member) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="text-sm text-dimmed">
      No team members found.
    </p>

    <DevJson
      v-if="isDev"
      title="Team (JSON)"
      context="collection manager · team"
      :data="collection"
      :default-open="false"
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenTeamMember } from '../../../../models/kitchen-team.model'

const props = withDefaults(
  defineProps<{
    collection?: KitchenTeamMember[]
    title?: string
    description?: string
  }>(),
  {
    title: 'Team',
    description: 'Kitchen team members for this kitchen.',
  }
)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const collection = computed(() => props.collection ?? [])
const currentMembers = computed(() =>
  collection.value.filter((member) => (member as Record<string, unknown>).active !== false)
)
const memberName = (member: KitchenTeamMember) => normalizeString(member.name)
const memberDisplayName = (member: KitchenTeamMember) =>
  memberName(member) || 'Missing team member name'
const memberRole = (member: KitchenTeamMember) => normalizeString(member.role)
const memberStations = (member: KitchenTeamMember) =>
  Array.isArray(member.station_ids)
    ? member.station_ids.map((value) => normalizeString(value)).filter(Boolean).join(', ')
    : ''
const hasMissingName = (member: KitchenTeamMember) => !memberName(member)
const sortOrder = (member: KitchenTeamMember) => {
  const value = Number(member.sort_order)
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}
const sortedMembers = computed(() =>
  [...currentMembers.value].sort((left, right) => {
    const byOrder = sortOrder(left) - sortOrder(right)
    if (byOrder) return byOrder

    const byName = memberDisplayName(left).localeCompare(memberDisplayName(right))
    if (byName) return byName

    return normalizeString(left.id).localeCompare(normalizeString(right.id))
  })
)
const isDev = import.meta.dev
</script>
