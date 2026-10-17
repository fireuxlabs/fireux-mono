<template>
  <div class="flex flex-col gap-6">
    <section aria-labelledby="kitchen-essentials">
      <header class="mb-3">
        <h2 id="kitchen-essentials" class="text-lg font-semibold">
          Your kitchen today
        </h2>
        <p class="text-sm text-muted">
          Check your foundations, then open a working area.
        </p>
      </header>
      <div
        class="grid auto-rows-fr gap-2 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Capability summaries"
      >
        <Summary
          title="Team"
          icon="i-lucide-users"
          to="/workspace/kitchen/team"
          :value="team.members.value.length"
          :pending="team.pending.value"
          :error="team.error.value"
        >
          <div class="flex flex-wrap gap-1">
            <UTooltip
              v-for="member in team.members.value.slice(0, 8)"
              :key="member.id || member.memberId"
              :text="member.name"
            >
              <UAvatar
                :src="member.avatar || undefined"
                :alt="member.name"
                size="xs"
                tabindex="0"
              />
            </UTooltip>
          </div>
          <p v-if="!team.members.value.length" class="text-xs text-muted">
            No team members yet.
          </p>
        </Summary>
        <Summary
          title="Tests"
          icon="i-lucide-flask-conical"
          to="/workspace/kitchen/developer/test"
          :value="tests.records.value?.length || 0"
          :pending="tests.pending.value"
          :error="tests.error.value"
        >
          <ul class="flex flex-wrap gap-x-2 text-xs">
            <li
              v-for="test in (tests.records.value || []).slice(0, 3)"
              :key="test.id"
              class="truncate"
            >
              {{ test.value }}
            </li>
          </ul>
          <p v-if="!tests.records.value?.length" class="text-xs text-muted">
            No tests yet.
          </p>
        </Summary>
        <Summary
          title="Kitchen Profile"
          icon="i-lucide-id-card"
          to="/workspace/kitchen/identity"
          :value="`${completion}%`"
          :description="`${filled} of ${fields.length} fields complete`"
          :pending="identity.pending.value"
          :error="identity.placeOutcome.value === 'error'"
        >
          <UProgress
            :model-value="completion"
            aria-label="Identity completion"
          />
        </Summary>
        <Summary
          title="Calendar"
          icon="i-lucide-calendar"
          to="/workspace/kitchen/calendar"
          value="—"
          description="Summary not connected"
          placeholder
        />
        <Summary
          title="Workspaces"
          icon="i-lucide-panels-top-left"
          :to="workspaceEntryPath"
          :value="index.collection.value.length"
          description="Kitchens available"
          :pending="index.outcome.value === 'pending'"
          :error="index.outcome.value === 'error'"
        />
        <Summary
          title="Notifications"
          icon="i-lucide-bell"
          :value="notifications.unreadCount.value"
          description="Unread across workspaces"
          :pending="notifications.pending.value"
          :error="notifications.error.value"
        >
          <UButton
            label="Open feed"
            color="neutral"
            variant="link"
            size="xs"
            :ui="{ base: 'p-0' }"
            @click="notificationPanel.open()"
          />
        </Summary>
      </div>
    </section>
    <ActivitySummary />
    <UAlert
      title="Daily readiness is not connected yet"
      description="Urgent kitchen issues, upcoming prep and due checks will appear here when their live sources are available. Profile completion is not a readiness check."
      icon="i-lucide-calendar-check"
      color="neutral"
      variant="subtle"
    />
    <section
      v-for="group in summaryGroups"
      :key="group.name"
      :aria-label="group.name"
    >
      <header class="mb-3 flex items-center gap-3">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          ><UIcon :name="group.icon" class="size-5"
        /></span>
        <div>
          <h2 class="font-semibold">{{ group.name }}</h2>
          <p class="text-xs text-muted">{{ group.description }}</p>
        </div>
      </header>
      <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <Summary
          v-for="capability in group.items"
          :key="capability.to"
          :title="capability.label"
          :icon="capability.icon || 'i-lucide-layout-grid'"
          :to="capability.to"
          description="Summary not connected"
          placeholder
        />
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { computed } from 'vue'
import type { NavItem } from 'fireux-core/runtime/composables/navigation/types'
import { useNav } from 'fireux-core/runtime/composables/navigation/useNav'
import Summary from 'fireux-core/runtime/components/Workspace/Overview/Summary.vue'
import ActivitySummary from './Activity.vue'
import { useKitchenTeamSummary } from '../../../composables/team/useKitchenTeamSummary'
import { useKitchenTestRecords } from '../../../composables/test/useKitchenTestRecords'
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { useKitchenWorkspaceIndex } from '../../../composables/workspace/useKitchenWorkspaceIndex'
import { useUserNotifications } from 'fireux-core/runtime/user/composables/notifications/useUserNotifications'
import { useWorkspaceNotifications } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceNotifications'
import { useKitchenWorkspacePlace } from '../../../composables/workspace/identity/useKitchenWorkspacePlace'
import { readPlaceIdentity } from 'fireux-places/runtime/place/models/identity-edit'

const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const navigation = useNav(['workspace'])
const coveredPaths = new Set(
  ['overview', 'team', 'test', 'identity', 'calendar', 'notifications'].map(
    (name) => `/workspace/kitchen/${name}`
  )
)
for (const path of [
  'orders',
  'menus',
  'food/dishes',
  'food/recipes',
  'food/ingredients',
  'stations',
  'stock/suppliers',
  'stock/waste',
  'reports/finance',
])
  coveredPaths.add(`/workspace/kitchen/${path}`)
const pendingSummaries = computed(() =>
  navigation.items.value
    .filter(
      (item) =>
        item.desktop &&
        item.to.startsWith('/workspace/kitchen/') &&
        !coveredPaths.has(item.to)
    )
    .sort((a, b) => a.order - b.order)
    .flatMap<Pick<NavItem, 'label' | 'to' | 'icon' | 'group' | 'groupIcon'>>(
      (item) =>
        item.children?.length
          ? [
              ...(item.groupIndex
                ? [{ ...item, group: item.label, groupIcon: item.icon }]
                : []),
              ...item.children.map((child) => ({
                ...child,
                group: item.label,
                groupIcon: item.icon,
              })),
            ]
          : [item]
    )
    .filter((item) => !coveredPaths.has(item.to))
)
const groupPresentation: Record<string, string> = {
  'Orders & Service': 'Follow orders from arrival to handoff.',
  'Prep & Production': 'Plan the work before service starts.',
  'Menus': 'Keep what you serve and how you make it together.',
  'Stock & Purchasing': 'Buy, receive and account for what the kitchen uses.',
  'Food Safety': 'Checks, evidence and follow-up throughout the day.',
  Reports: 'Review results from recorded kitchen activity.',
  Settings: 'Devices, connections and access.',
}
const summaryGroups = computed(() => {
  const names = [
    ...new Set(pendingSummaries.value.map((item) => item.group || item.label)),
  ]
  return names.map((name) => ({
    name,
    icon:
      pendingSummaries.value.find((item) => (item.group || item.label) === name)
        ?.groupIcon || 'i-lucide-layout-grid',
    description: groupPresentation[name] || '',
    items: pendingSummaries.value.filter(
      (item) => (item.group || item.label) === name
    ),
  }))
})
const workspace = useKitchenWorkspace()
const index = useKitchenWorkspaceIndex()
const team = useKitchenTeamSummary()
const tests = useKitchenTestRecords(workspace.id)
const notifications = useUserNotifications()
const notificationPanel = useWorkspaceNotifications()
const identity = useKitchenWorkspacePlace()
const fields = computed(() =>
  Object.values(readPlaceIdentity(identity.place.value))
)
const filled = computed(
  () => fields.value.filter((value) => String(value || '').trim()).length
)
const completion = computed(() =>
  fields.value.length
    ? Math.round((filled.value / fields.value.length) * 100)
    : 0
)
</script>
