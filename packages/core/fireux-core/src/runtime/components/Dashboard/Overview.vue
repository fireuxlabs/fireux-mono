<!-- Concurrent edit — 2026-07-21 15:25 CEST — Dashboard Overview product pass: lead with the real User and current workspace while preserving authority boundaries. -->
<template>
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
        This is usually a permissions or setup issue in the active identity doc.
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
      <details v-if="isDev" class="mt-4 text-left">
        <summary class="cursor-pointer text-xs text-dimmed">
          Debug details (dev only)
        </summary>
        <pre class="mt-2 max-h-48 overflow-auto rounded border p-3 text-xs">{{ coreErrorDebug }}</pre>
      </details>
    </template>
  </MoleculesStateCard>

  <template v-else-if="coreUser && userCard">
    <div class="space-y-4">
      <DashboardOverviewUser
        :card="userCard"
        :has-custom-avatar="hasCustomAvatar"
        :private-outcome="privateOutcome"
      />

      <div :class="hasEcosystem ? 'grid gap-4 xl:grid-cols-3' : 'grid gap-4'">
        <DashboardOverviewApp
          :class="hasEcosystem ? 'xl:col-span-2' : ''"
          :app-name="fireux.appName"
          :app-short-name="fireux.appShortName"
          :app-card="appCard"
          :app-outcome="appOutcome"
          :membership="resolvedAppUser"
          :membership-outcome="membershipOutcome"
          :profile-entries="appProfileEntries"
          :can-open-console="canOpenConsole"
          :console-path="consoleEntryPath"
          :console-label="consoleEntryLabel"
          :console-icon="consoleEntryIcon"
          :can-manage-app="canManageApp"
          :can-self-join="canSelfJoin"
        />
        <DashboardOverviewEcosystem
          v-if="hasEcosystem"
          :name="ecosystemName"
          :profile-entries="ecosystemProfileEntries"
          :show-directory-action="fireux.isGlobal"
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
</template>

<script setup lang="ts">
import { computed, useRuntimeConfig } from '#imports'
import type { NavItem } from '../../composables/fireux/app/nav.types'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useCurrentAppContext } from '../../composables/fireux/app/useCurrentAppContext'
import { useConsoleEntryCta } from '../../composables/fireux/app/ui/nav/useConsoleEntryCta'
import { useDashboardNav } from '../../composables/fireux/app/ui/nav/useDashboardNav'
import { useAppInterface } from '../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { USER_ECOSYSTEM_AVATAR_SRC } from '../../models/core/user.model'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../composables/fireux/firestore/vuefire'
import DashboardOverviewApp from './Overview/App.vue'
import DashboardOverviewEcosystem from './Overview/Ecosystem.vue'
import DashboardOverviewUser from './Overview/User.vue'
import type {
  DashboardOverviewOutcome,
  DashboardOverviewProfileEntry,
} from './Overview/types'

const fireux = useFireUXConfig()
const isDev = computed(() => import.meta.dev)
const userApi = useUser()
const { uid } = useAuth()
const appContext = useCurrentAppContext()
const { profile: appToCard } = useAppInterface()
const runtimeConfig = useRuntimeConfig()
const { activeProfileEntries, availableProfileEntries } = useDashboardNav()
const { consoleActions, hasConsoleEntry, consoleEntryPath } =
  useConsoleEntryCta()

const {
  coreUser,
  coreError,
  coreOutcome,
  privateUser,
  privatePending,
  privateError,
  profile: userToCard,
} = userApi
const {
  app,
  membership: appUser,
  pending: appPending,
  error: appError,
} = appContext
const appOutcome = computed<DashboardOverviewOutcome>(() => {
  if (appError.value) return 'error'
  if (appPending.value) return 'pending'
  return app.value ? 'ready' : 'missing'
})

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
    },
    null,
    2
  )
})
const coreIsMissing = computed(
  () => coreOutcome.value === 'missing' || coreUser.value === null
)
const userCard = computed(() => userToCard(coreUser.value ?? null))
const appCard = computed(() => appToCard(app.value ?? null))
const resolvedAppUser = computed(() => appUser.value ?? null)
const hasCustomAvatar = computed(
  () =>
    Boolean(coreUser.value?.avatar) &&
    coreUser.value?.avatar !== USER_ECOSYSTEM_AVATAR_SRC
)

const privateOutcome = computed<DashboardOverviewOutcome>(() => {
  if (privateError.value) return 'error'
  if (privatePending.value || privateUser.value === undefined) return 'pending'
  return privateUser.value ? 'ready' : 'missing'
})

const membershipOutcome = computed<DashboardOverviewOutcome>(() => {
  if (appError.value) return 'error'
  if (appPending.value || appUser.value === undefined) return 'pending'
  return appUser.value ? 'ready' : 'missing'
})

const hasEcosystem = computed(() => Boolean(fireux.ecosystemId))
const runtimeEcosystem = computed(
  () =>
    (runtimeConfig.public as {
      firebaseEcosystem?: { name?: unknown }
    }).firebaseEcosystem
)
const ecosystemName = computed(() =>
  formatEcosystemName(runtimeEcosystem.value?.name)
)
const consoleEntryAction = computed(() => consoleActions.value[0] ?? null)
const consoleEntryLabel = computed(
  () => consoleEntryAction.value?.label || 'Console'
)
const consoleEntryIcon = computed(
  () => consoleEntryAction.value?.icon || 'i-lucide-panels-top-left'
)
const canOpenConsole = computed(
  () =>
    appOutcome.value === 'ready' &&
    membershipOutcome.value === 'ready' &&
    Boolean(hasConsoleEntry.value) &&
    appUser.value?.role === 'admin' &&
    appUser.value.console_enabled === true
)
const canManageApp = computed(
  () =>
    appOutcome.value === 'ready' &&
    membershipOutcome.value === 'ready' &&
    appUser.value?.role === 'admin'
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
const ecosystemProfileEntries = computed<DashboardOverviewProfileEntry[]>(() => [])
const appProfileEntries = computed<DashboardOverviewProfileEntry[]>(() => [
  ...activeRows.value,
  ...availableRows.value,
])
</script>
