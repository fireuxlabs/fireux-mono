<template>
  <UPageCard
    :title="fireux.appName"
    description="Your access to this App."
    variant="subtle"
  >
    <div v-if="appOutcome !== 'ready'">
      <p v-if="appOutcome === 'idle' || appOutcome === 'pending'">
        Loading App details…
      </p>
      <UAlert
        v-else-if="appOutcome === 'error'"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="App details unavailable"
        description="Your public profile is still available. Current app details could not be read."
      />
      <UAlert
        v-else-if="appOutcome === 'empty'"
        color="warning"
        variant="soft"
        icon="i-lucide-file-warning"
        title="App setup needs attention"
        description="The app is running, but its shared details are unavailable. An app administrator may need to check its setup."
      />
    </div>

    <UButton
      v-if="canOpenWorkspace"
      :to="workspaceEntryHref"
      label="Open Workspace"
      :icon="workspaceEntryIcon"
    />

    <div v-if="membershipOutcome !== 'ready' || canManageApp">
      <FireState
        v-if="membershipOutcome === 'idle' || membershipOutcome === 'pending'"
        outcome="pending"
        entity="App membership"
      />

      <UAlert
        v-else-if="membershipOutcome === 'error'"
        color="error"
        variant="soft"
        icon="i-lucide-shield-alert"
        title="App access unavailable"
        description="Your public identity is unaffected, but this app membership could not be read."
      />

      <UAlert
        v-else-if="membershipOutcome === 'empty'"
        color="warning"
        variant="soft"
        icon="i-lucide-user-round-x"
        title="No app membership"
        description="Join this App to use actions that require membership. Your public profile is unchanged."
      >
        <template #actions>
          <UButton to="/users/create?redirect=%2Fdashboard" label="Join App" />
        </template>
      </UAlert>

      <UButton
        v-else-if="canManageApp"
        to="/dashboard/admin"
        :label="`Manage ${fireux.appName}`"
        icon="i-lucide-shield-check"
        color="neutral"
        variant="soft"
      />
    </div>

    <template v-if="membershipOutcome === 'ready' && appProfileEntries.length">
      <USeparator />

      <div>
        <h3>Profiles in this app</h3>
        <p>
          Open active profiles or create one of the profiles this app supports.
        </p>

        <div>
          <div v-for="entry in appProfileEntries" :key="entry.profileId">
            <div>
              <UIcon :name="entry.icon || 'i-lucide-user-round'" />
              <div>
                <p>
                  {{ entry.label }}
                </p>
                <p>
                  {{ entry.active ? 'Active profile' : 'Available to create' }}
                </p>
              </div>
            </div>
            <UButton
              :to="entry.to"
              :label="entry.active ? 'Open' : 'Create'"
              :aria-label="`${entry.active ? 'Open' : 'Create'} ${entry.label} profile`"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </div>
        </div>
      </div>
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NavItem } from '../../../composables/navigation/types'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAppRead } from '../../../app/composables/useAppRead'
import { useAppUserRead } from '../../../app/composables/membership/useAppUserRead'
import { useWorkspaceEntryCta } from '../../../workspace/composables/useWorkspaceEntryCta'
import { useNav } from '../../../composables/navigation/useNav'
import { useDashboardProfiles } from '../../../composables/navigation/useDashboardProfiles'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import type { DashboardOverviewProfileEntry } from './types'
const fireux = useFireUXConfig()
const { uid } = useAuth()
const { desktop } = useNav(['dashboard'])
const { activeProfileEntries, availableProfileEntries } =
  useDashboardProfiles(desktop)
const { workspaceActions, hasWorkspaceEntry, workspaceEntryHref } =
  useWorkspaceEntryCta()
const { outcome: appOutcome } = useAppRead(fireux.appId)
const { appUser, outcome: membershipOutcome } = useAppUserRead(
  fireux.appId,
  uid
)
const workspaceEntryAction = computed(() => workspaceActions.value[0] ?? null)
const workspaceEntryIcon = computed(
  () => workspaceEntryAction.value?.icon || 'i-lucide-panels-top-left'
)
const canOpenWorkspace = computed(
  () => appOutcome.value === 'ready' && Boolean(hasWorkspaceEntry.value)
)
const canManageApp = computed(
  () =>
    appOutcome.value === 'ready' &&
    membershipOutcome.value === 'ready' &&
    (appUser.value?.role === 'admin' || appUser.value?.role === 'dev')
)
function toProfileEntry(
  item: NavItem,
  active: boolean
): DashboardOverviewProfileEntry | null {
  if (!item.profileId) return null
  return {
    profileId: item.profileId,
    label: item.label,
    icon: item.icon,
    to: item.to,
    active,
  }
}

const activeRows = computed<DashboardOverviewProfileEntry[]>(() =>
  activeProfileEntries.value
    .map((entry) => toProfileEntry(entry, true))
    .filter((entry): entry is DashboardOverviewProfileEntry => Boolean(entry))
)
const availableRows = computed<DashboardOverviewProfileEntry[]>(() =>
  availableProfileEntries.value
    .map((entry) => toProfileEntry(entry, false))
    .filter((entry): entry is DashboardOverviewProfileEntry => Boolean(entry))
)
const appProfileEntries = computed<DashboardOverviewProfileEntry[]>(() => [
  ...activeRows.value,
  ...availableRows.value,
])
</script>
