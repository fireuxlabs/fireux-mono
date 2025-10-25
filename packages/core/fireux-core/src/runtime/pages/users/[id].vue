<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-base font-semibold">{{ headerTitle }}</h1>
          <UBadge v-if="userId" variant="subtle">{{ userId }}</UBadge>
        </div>
      </template>

      <div v-if="isLoading" class="space-y-4">
        <USkeleton class="h-16 rounded-xl" />
        <USkeleton class="h-32 rounded-xl" />
      </div>

      <div v-else-if="resolvedUser" class="space-y-4">
        <MoleculesPill
          :avatar="resolvedUser.avatar"
          :title="pillTitle"
          :subtitle="pillSubtitle"
        />

        <div class="flex flex-wrap gap-2">
          <UBadge variant="soft" color="primary">{{ coreStatus }}</UBadge>
          <UBadge v-if="isTenant" variant="soft" color="gray">{{
            appStatus
          }}</UBadge>
        </div>

        <dl class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="item in infoRows"
            :key="item.label"
            class="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800"
          >
            <dt
              class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              {{ item.label }}
            </dt>
            <dd class="mt-1 text-gray-900 dark:text-gray-100">
              {{ item.value }}
            </dd>
          </div>
        </dl>
      </div>

      <p v-else class="text-sm text-gray-500 dark:text-gray-400">
        User not found.
      </p>
    </UCard>

    <OrganismsUserCardsProfile v-if="profileCardUser" :user="profileCardUser" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreRead } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreRead.ts'
import {
  type CoreUserDoc,
  type AppUserDoc,
} from 'fireux-core/runtime/models/core/user.model.ts'
import { formatFirestoreTimestamp } from 'fireux-core/runtime/utils/formatTimestamp.ts'

const normalizeStringArray = (input: unknown): string[] => {
  if (!Array.isArray(input)) return []
  return input
    .filter(
      (entry): entry is string =>
        typeof entry === 'string' && entry.trim().length > 0
    )
    .map((entry) => entry.trim())
}

const route = useRoute()
const rawId = route.params.id
let resolvedId = ''
if (Array.isArray(rawId)) {
  resolvedId = rawId[0] ?? ''
} else if (rawId !== undefined && rawId !== null) {
  resolvedId = String(rawId)
}
const userId = resolvedId

const { isTenant, appId } = useFireUXConfig()
const { firestoreFetchDoc } = useFirestoreRead()

const coreRef = userId
  ? firestoreFetchDoc<CoreUserDoc>('core-users', userId)
  : null
const appRef =
  userId && isTenant && appId
    ? firestoreFetchDoc<AppUserDoc>(`apps/${appId}/users`, userId)
    : null

const coreUser = computed<CoreUserDoc | null>(() => coreRef?.value ?? null)
const appUser = computed<AppUserDoc | null>(() => appRef?.value ?? null)
const resolvedUser = computed(() => appUser.value ?? coreUser.value ?? null)

const isCoreLoading = computed(() =>
  Boolean(coreRef && coreRef.value === undefined)
)
const isAppLoading = computed(() =>
  Boolean(appRef && appRef.value === undefined)
)
const isLoading = computed(() => isCoreLoading.value || isAppLoading.value)

const coreStatus = computed(() => {
  if (!coreRef) return 'Unavailable'
  if (coreRef.value === undefined) return 'Loading…'
  return coreUser.value ? 'Core loaded' : 'Core missing'
})
const appStatus = computed(() => {
  if (!isTenant) return 'Overlay unavailable'
  if (!appRef) return 'Overlay unavailable'
  if (appRef.value === undefined) return 'Loading…'
  return appUser.value ? 'App loaded' : 'App missing'
})

const pillTitle = computed(
  () =>
    resolvedUser.value?.display_name ||
    resolvedUser.value?.handle ||
    resolvedUser.value?.id ||
    userId ||
    'User'
)
const pillSubtitle = computed(
  () =>
    resolvedUser.value?.email ||
    resolvedUser.value?.handle ||
    resolvedUser.value?.id ||
    userId
)

const headerTitle = computed(() =>
  resolvedUser.value ? pillTitle.value : 'User Details'
)

const profileNames = computed(() => {
  const fromApp = normalizeStringArray(appUser.value?.profiles)
  if (fromApp.length) return fromApp
  return normalizeStringArray(coreUser.value?.profiles)
})

const profileList = computed(() => {
  if (!profileNames.value.length) return '—'
  if (profileNames.value.length <= 3) {
    return profileNames.value.join(', ')
  }
  return `${profileNames.value.length} profiles`
})

const adminOfList = computed(() =>
  normalizeStringArray(coreUser.value?.adminOf)
)

const memberOfList = computed(() =>
  normalizeStringArray(coreUser.value?.userOf)
)

const createdAt = computed(
  () =>
    formatFirestoreTimestamp(
      appUser.value?.created_at ?? coreUser.value?.created_at,
      { fallback: undefined }
    ) ?? '—'
)
const updatedAt = computed(
  () =>
    formatFirestoreTimestamp(
      appUser.value?.updated_at ?? coreUser.value?.updated_at,
      { fallback: undefined }
    ) ?? '—'
)

const createdAtDisplay = computed(() =>
  createdAt.value === '—' ? null : createdAt.value
)
const updatedAtDisplay = computed(() =>
  updatedAt.value === '—' ? null : updatedAt.value
)

const infoRows = computed(() => {
  const rows = [
    { label: 'Email', value: resolvedUser.value?.email ?? '—', always: true },
    {
      label: 'Handle',
      value: resolvedUser.value?.handle ?? '—',
      always: false,
    },
    {
      label: 'Role',
      value: appUser.value?.role ?? '—',
      always: false,
      tenantOnly: true,
    },
    { label: 'Profiles', value: profileList.value, always: false },
    { label: 'Created', value: createdAt.value, always: false },
    { label: 'Updated', value: updatedAt.value, always: false },
  ]

  return rows
    .filter((row) => {
      if ('tenantOnly' in row && row.tenantOnly && !isTenant) {
        return false
      }
      return row.always || row.value !== '—'
    })
    .map((row) => ({ label: row.label, value: row.value }))
})

const profileCardUser = computed(() => {
  if (!resolvedUser.value) return null

  return {
    id: resolvedUser.value.id || userId,
    display_name: pillTitle.value,
    handle: resolvedUser.value.handle ?? null,
    email: resolvedUser.value.email ?? null,
    avatar: resolvedUser.value.avatar ?? null,
    profiles: profileNames.value,
    adminOf: adminOfList.value,
    userOf: memberOfList.value,
    role: appUser.value?.role ?? null,
    appId: isTenant && appId ? appId : null,
    created_in: isTenant ? 'Tenant overlay' : 'Global core',
    created_at: createdAtDisplay.value,
    updated_at: updatedAtDisplay.value,
    coreStatus: coreStatus.value,
    appStatus: isTenant ? appStatus.value : null,
  }
})

useHead({
  title: computed(() =>
    resolvedUser.value ? `${pillTitle.value} · User` : 'User Details'
  ),
})
</script>
