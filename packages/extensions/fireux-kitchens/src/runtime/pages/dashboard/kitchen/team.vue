<template>
  <UDashboardPanel id="dashboard-kitchen-team">
    <template #header>
      <LayoutsDashboardNavbar title="Kitchen Team" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Team roster</h2>
                <UBadge variant="soft" color="neutral">{{ teamRows.length }}</UBadge>
              </div>
              <p class="text-xs text-dimmed">
                Active chef team for {{ runtimeKitchenName }}.
              </p>
            </div>
          </template>

          <div v-if="teamRows.length" class="space-y-3">
            <div
              v-for="entry in teamRows"
              :key="entry.member.id"
              class="rounded-md border border-default p-3"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <ProfilesChefCardsPill
                  v-if="entry.card"
                  v-bind="entry.card"
                  :show-badges="false"
                />
                <div v-else class="text-sm font-medium">{{ entry.member.display_name }}</div>

                <div class="flex flex-wrap items-center gap-2">
                  <UBadge variant="soft" color="neutral">
                    {{ roleLabel(entry.member.role) }}
                  </UBadge>
                  <UBadge variant="soft" color="neutral">
                    {{ entry.member.station || 'Station n/a' }}
                  </UBadge>
                  <UBadge
                    variant="soft"
                    :color="entry.member.status === 'active' ? 'success' : 'neutral'"
                  >
                    {{ entry.member.status }}
                  </UBadge>
                </div>
              </div>

              <p class="mt-2 text-xs text-dimmed">
                Shift: {{ entry.member.shift_label || 'Unassigned' }} · Rate:
                {{ entry.member.currency || 'CHF' }} {{ entry.member.hourly_rate }}/hr · Certs:
                {{ certsLabel(entry.member.certifications) }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm text-dimmed">No team members yet.</p>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import { useRuntimeKitchen } from '../../../composables/fireux/app/useRuntimeKitchen'
import { useChef } from '../../../composables/fireux/firestore/profiles/Chef/useChef'
import type { KitchenTeamRole } from '../../../models/kitchen-team.model'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-team',
    label: 'Team',
    icon: 'i-lucide-users',
    order: 6,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtimeKitchen = useRuntimeKitchen()
const runtimeKitchenName = computed(
  () => String(runtimeKitchen.value?.name || runtimeKitchen.value?.id || 'Kitchen')
)

const { card: toChefCard } = useChef()

type TeamEntry = (typeof dummyKitchenScenario.teamMembers)[number]
type ChefCardUser = Parameters<typeof toChefCard>[1]

const toUserLike = (user: TeamEntry['user']): ChefCardUser => {
  if (!user) return null
  return {
    display_name: String((user as any).display_name || ''),
    avatar: String((user as any).avatar || ''),
    id: (user as any).id,
    handle: (user as any).handle,
    email: (user as any).email,
  }
}

const teamRows = computed(() =>
  (dummyKitchenScenario.teamMembers ?? []).map((entry) => ({
    ...entry,
    card: toChefCard(entry.chef, toUserLike(entry.user)),
  }))
)

const roleLabels: Record<KitchenTeamRole, string> = {
  head_chef: 'Head Chef',
  sous_chef: 'Sous Chef',
  line_cook: 'Line Cook',
  prep_cook: 'Prep Cook',
  dishwasher: 'Dishwasher',
  runner: 'Runner',
  manager: 'Manager',
  other: 'Other',
}

const roleLabel = (role: KitchenTeamRole) => roleLabels[role] || 'Other'

const certsLabel = (certifications: string[]) => {
  const resolved = (certifications ?? []).filter(Boolean)
  if (!resolved.length) return 'None'
  return resolved.join(', ')
}
</script>
