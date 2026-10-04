<!-- Concurrent edit — 2026-07-21 15:25 CEST — Dashboard Overview product pass: lead with the real User and current workspace while preserving authority boundaries. -->
<template>
  <div class="contents">
    <MoleculesStateCard
      v-if="coreIsLoading"
      entity="user overview"
      kind="document"
      loading
    />

    <MoleculesStateCard
      v-else-if="coreIsError"
      entity="user overview"
      kind="document"
      state="error"
      title="Unable to load your user overview"
      description="Your authentication works, but your account profile could not be loaded from Firestore right now."
    >
      <template #default>
        <p class="text-xs text-dimmed">
          This is usually a permissions or setup issue in the active identity
          doc.
        </p>
        <div class="mt-3 flex justify-center gap-2">
          <UButton
            to="/users/create"
            label="Review user setup"
            icon="i-lucide-user-round-plus"
            size="sm"
          />
          <UButton
            to="/auth"
            label="Sign in again"
            icon="i-lucide-refresh-cw"
            size="sm"
            color="neutral"
            variant="soft"
          />
        </div>
        <details v-if="isDev" open class="mt-4 text-left">
          <summary class="cursor-pointer text-xs text-dimmed">
            Debug details (dev only)
          </summary>
          <pre class="mt-2 max-h-48 overflow-auto rounded border p-3 text-xs">{{
            coreErrorDebug
          }}</pre>
        </details>
      </template>
    </MoleculesStateCard>

    <template v-else-if="coreUser && userCard">
      <div class="space-y-4">
        <DashboardOverviewUser
          :card="userCard"
          :has-custom-avatar="hasCustomAvatar"
          :account-outcome="accountOutcome"
        />

        <div class="space-y-4">
          <DashboardOverviewApp
            :app-name="fireux.appName"
            :app-short-name="fireux.appShortName"
            :app-card="appCard"
            :app-outcome="appOutcome"
            :membership="resolvedAppUser"
            :membership-outcome="membershipOutcome"
            :profile-entries="appProfileEntries"
            :can-open-workspace="canOpenWorkspace"
            :workspace-path="workspaceEntryPath"
            :workspace-label="workspaceEntryLabel"
            :workspace-icon="workspaceEntryIcon"
            :can-manage-app="canManageApp"
            :can-self-join="canSelfJoin"
          >
            <template v-if="$slots.workspace" #workspace>
              <slot name="workspace" />
            </template>
          </DashboardOverviewApp>
          <DashboardOverviewEcosystem
            v-if="hasEcosystem && ecosystemProfileEntries.length"
            :name="ecosystemName"
            :profile-entries="ecosystemProfileEntries"
            :show-directory-action="false"
          />
        </div>
      </div>
    </template>

    <div v-else-if="coreIsMissing" class="space-y-4">
      <UPageHeader
        headline="Overview"
        title="Finish your User setup"
        description="Your sign-in works, but the public identity behind this dashboard still needs to be restored."
      />
      <UAlert
        color="warning"
        variant="subtle"
        orientation="horizontal"
        icon="i-lucide-user-round-plus"
        title="Public identity not set up"
        description="Set up your User to restore the identity apps and profiles connect to."
      >
        <template #actions>
          <UButton
            to="/users/create"
            label="Finish setup"
            icon="i-lucide-arrow-right"
          />
        </template>
      </UAlert>
    </div>

    <MoleculesStateCard v-else entity="user overview" kind="document" loading />
  </div>
</template>

<script setup lang="ts">
import { computed, useRuntimeConfig } from '#imports'
import type { NavItem } from '../../composables/navigation/types'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useAppRead } from '../../app/composables/useAppRead'
import { useAppUserRead } from '../../app/composables/membership/useAppUserRead'
import { useWorkspaceEntryCta } from '../../composables/fireux/workspace/useWorkspaceEntryCta'
import { useDashboardNav } from '../../composables/navigation/useDashboardNav'
import { useAppView } from '../../app/composables/useAppView'
import { useUserRead } from '../../user/composables/useUserRead'
import { useUserAccount } from '../../user/composables/account/useUserAccount'
import { useUserView } from '../../user/composables/useUserView'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { USER_ECOSYSTEM_AVATAR_SRC } from '../../user/utils/user-avatar'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'
import DashboardOverviewApp from './Overview/App.vue'
import DashboardOverviewEcosystem from './Overview/Ecosystem.vue'
import DashboardOverviewUser from './Overview/User.vue'
import type { DashboardOverviewProfileEntry } from './Overview/types'

const fireux = useFireUXConfig()
const isDev = computed(() => import.meta.dev)
const { uid, lastAccountProvisionError } = useAuth()
const { toCard: appToCard } = useAppView()
const runtimeConfig = useRuntimeConfig()
const { activeProfileEntries, availableProfileEntries } = useDashboardNav()
const { workspaceActions, hasWorkspaceEntry, workspaceEntryPath } =
  useWorkspaceEntryCta()

const {
  user: coreUser,
  error: coreError,
  outcome: coreOutcome,
} = useUserRead(uid)
const { outcome: accountOutcome } = useUserAccount()
const { profile: userToCard } = useUserView()
const { app, outcome: appOutcome } = useAppRead(fireux.appId)
const { appUser, outcome: membershipOutcome } = useAppUserRead(
  fireux.appId,
  uid
)

const coreIsLoading = computed(
  () => coreOutcome.value === 'idle' || coreOutcome.value === 'pending'
)
const coreIsError = computed(
  () => coreOutcome.value === 'error' || Boolean(coreError.value)
)
const identityDatabaseId = computed(() => {
  return readRuntimeIdentityFirestoreDatabaseId() || '(default)'
})
const coreErrorDebug = computed(() => {
  const value = coreError.value
  if (!value || typeof value !== 'object') {
    return JSON.stringify(
      {
        message: String(value || ''),
        authUid: uid.value || '',
        identityDatabaseId: identityDatabaseId.value,
        documentPath: uid.value ? `users/${uid.value}` : '',
        provisioningError: formatDebugError(lastAccountProvisionError.value),
      },
      null,
      2
    )
  }

  const record = value as {
    code?: unknown
    message?: unknown
    name?: unknown
    stack?: unknown
  }
  return JSON.stringify(
    {
      code: String(record.code ?? ''),
      name: String(record.name ?? ''),
      message: String(record.message ?? ''),
      stack: typeof record.stack === 'string' ? record.stack : undefined,
      authUid: uid.value || '',
      identityDatabaseId: identityDatabaseId.value,
      documentPath: uid.value ? `users/${uid.value}` : '',
      provisioningError: formatDebugError(lastAccountProvisionError.value),
    },
    null,
    2
  )
})

function formatDebugError(value: unknown) {
  if (!value) return null
  if (typeof value !== 'object') return String(value)
  const error = value as { code?: unknown; message?: unknown; name?: unknown }
  return {
    code: String(error.code ?? ''),
    name: String(error.name ?? ''),
    message: String(error.message ?? ''),
  }
}
const coreIsMissing = computed(
  () => coreOutcome.value === 'missing' || coreUser.value === null
)
const userCard = computed(() => userToCard(coreUser.value ?? null))
const appCard = computed(() => appToCard(app.value ?? null))
const resolvedAppUser = computed(() =>
  appUser.value && uid.value ? { ...appUser.value, id: uid.value } : null
)
const hasCustomAvatar = computed(
  () =>
    Boolean(coreUser.value?.avatar) &&
    coreUser.value?.avatar !== USER_ECOSYSTEM_AVATAR_SRC
)

const hasEcosystem = computed(() => Boolean(fireux.ecosystemId))
const runtimeEcosystem = computed(
  () =>
    (
      runtimeConfig.public as {
        firebaseEcosystem?: { name?: unknown }
      }
    ).firebaseEcosystem
)
const ecosystemName = computed(() =>
  formatEcosystemName(runtimeEcosystem.value?.name)
)
const workspaceEntryAction = computed(() => workspaceActions.value[0] ?? null)
const workspaceEntryLabel = computed(
  () => workspaceEntryAction.value?.label || 'Workspace'
)
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
const canSelfJoin = computed(
  () => appOutcome.value === 'ready' && app.value?.self_join_enabled === true
)

function formatEcosystemName(value: unknown): string {
  if (typeof value !== 'string') return 'your ecosystem'
  const name = value.trim()
  if (!name) return 'your ecosystem'
  if (name.toLowerCase() === 'fireux') return 'FireUX'
  return name.charAt(0).toUpperCase() + name.slice(1)
}

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
const ecosystemProfileEntries = computed<DashboardOverviewProfileEntry[]>(
  () => []
)
const appProfileEntries = computed<DashboardOverviewProfileEntry[]>(() => [
  ...activeRows.value,
  ...availableRows.value,
])
</script>
