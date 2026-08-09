<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Kitchen members</h2>
            <p>Operational people records for the selected kitchen.</p>
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
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user-round" class="size-4 text-dimmed" />
            <h3 class="truncate text-sm font-semibold text-highlighted">
              {{ memberDisplayName(member) }}
            </h3>
          </div>

          <p class="mt-1 text-sm text-dimmed">
            {{ memberRole(member) || 'Missing role' }}
          </p>
        </div>
      </div>

      <p v-else class="text-sm text-dimmed">
        No team members found.
      </p>
    </UCard>

    <DevFireuxDebugPanel
      title="Kitchen team"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleTeam } from '../../../../composables/fireux/console/kitchen/team/useKitchenConsoleTeam'
import type { KitchenTeamMember } from '../../../../models/kitchen/team.model'

const { teamMembers, debug } = useKitchenConsoleTeam()
const normalizeString = (value: unknown) => String(value ?? '').trim()
const memberName = (member: KitchenTeamMember) => normalizeString(member.name)
const memberDisplayName = (member: KitchenTeamMember) =>
  memberName(member) || 'Missing team member name'
const memberRole = (member: KitchenTeamMember) => normalizeString(member.role)
const sortOrder = (member: KitchenTeamMember) => {
  const value = Number(member.sort_order)
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER
}
const sortedMembers = computed(() =>
  teamMembers.value
    .filter((member) => member.active !== false)
    .sort((left, right) => {
      const byOrder = sortOrder(left) - sortOrder(right)
      if (byOrder) return byOrder

      return memberDisplayName(left).localeCompare(memberDisplayName(right))
    })
)
</script>
