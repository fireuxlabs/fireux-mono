<template>
  <UPage>
    <UPageHeader
      title="Dev · Apps"
      description="Model shape for Apps collection."
    />

    <UPageBody class="space-y-6">
      <UCard variant="subtle">
        <div class="text-xs text-gray-500 dark:text-gray-400">
          Mode:
          <span class="font-mono">
            {{ isTenant ? 'tenant (single app)' : 'global (all apps)' }}
          </span>
        </div>
      </UCard>

      <UCard variant="subtle">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Binding check (app ↔ users)
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Compares app users against core user mirrors and app admin lists.
                Membership is authoritative in <span class="font-mono">/apps/{appId}/users</span>.
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-3 text-sm">
          <div class="text-xs text-gray-500 dark:text-gray-400">
            <span class="font-mono">appId</span>: {{ bindingAppId || 'unknown' }} ·
            <span class="font-mono">app users</span>: {{ bindingAppUsersCount }} ·
            <span class="font-mono">admin_ids</span>: {{ bindingAdminIdsCount }}
          </div>

          <div v-if="bindingPending" class="text-xs text-gray-500 dark:text-gray-400">
            Checking…
          </div>

          <div v-else>
            <div v-if="!bindingTotal" class="text-sm text-emerald-600">
              No binding issues detected.
            </div>

            <div v-else class="space-y-3">
              <div v-if="binding.missingCore.length">
                <div class="text-sm font-medium">App users missing core user docs</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ binding.missingCore.join(', ') }}
                </div>
              </div>

              <div v-if="binding.missingUserOf.length">
                <div class="text-sm font-medium">Core users missing userOf mirror</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ binding.missingUserOf.join(', ') }}
                </div>
              </div>

              <div v-if="binding.missingAdminOf.length">
                <div class="text-sm font-medium">Admin app users missing adminOf mirror</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ binding.missingAdminOf.join(', ') }}
                </div>
              </div>

              <div v-if="binding.adminMissingAppUser.length">
                <div class="text-sm font-medium">Admin ids missing app user doc</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ binding.adminMissingAppUser.join(', ') }}
                </div>
              </div>

              <div v-if="binding.adminRoleMismatch.length">
                <div class="text-sm font-medium">Admin ids not marked admin in app users</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ binding.adminRoleMismatch.join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <DevModel
          :title="'Apps · Model'"
          :model="appModelRuntime"
        />
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-3">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Apps collection
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Browse apps resolved for this runtime and filter by model drift.
              </p>
              <DevDriftToolbar
                :drift-kind="appsDriftKind"
                :selected-field="appsSelectedField"
                :filter-options="appsFilterOptions"
                :copy-label="'Copy drift · Apps'"
                :copy-payload="appsDriftCopyPayload"
                @update:drift-kind="setAppsDriftKind"
                @update:selected-field="updateAppsSelectedField"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Apps (JSON)'"
            :data="allAppsJsonPayload"
            :default-open="false"
          />
        </template>

        <OrganismsAppCollectionManager
          :cards="cards"
          :total="total"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'
import { doc, getDoc } from 'firebase/firestore'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed, ref, watch } from 'vue'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useAppCollection } from '../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useAppUsers } from '../../composables/fireux/firestore/core/app/fetch/useAppUsers'
import { useAppInterface } from '../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { App as AppModelRuntime } from '../../models/core/app.model'
import type { User } from '../../models/core/user.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 20,
  },
  title: 'Dev · Apps',
  description: 'Developer view for Apps (collection-first).',
})

const appModelRuntime = AppModelRuntime

const { apps, count } = useAppCollection()
const { app: activeApp, pending: activeAppPending } = useApp()
const { card: makeCard } = useAppInterface()

const { appId: configAppId, isTenant } = useFireUXConfig()
const appCollection = computed(() =>
  isTenant ? (activeApp.value ? [activeApp.value] : []) : apps.value ?? []
)

const bindingAppId = computed(() => configAppId ?? '')
const bindingApp = computed(() =>
  appCollection.value.find((item) => item?.id === bindingAppId.value) ?? null
)

const { users: appUsers, pending: appUsersPending } = useAppUsers()
const db = useFirestore()
const coreUsers = ref<Map<string, User | null>>(new Map())
const bindingPending = ref(false)

const appUserIds = computed(() =>
  (appUsers.value ?? [])
    .map((u) => (u?.id ?? '').trim())
    .filter((id): id is string => Boolean(id))
)

watch(
  appUserIds,
  async (ids) => {
    if (import.meta.server) return
    const appId = bindingAppId.value
    if (!appId) return

    bindingPending.value = true
    const next = new Map<string, User | null>()

    await Promise.all(
      ids.map(async (id) => {
        try {
          const snap = await getDoc(doc(db, 'users', id) as any)
          next.set(id, snap.exists() ? (snap.data() as User) : null)
        } catch {
          next.set(id, null)
        }
      })
    )

    coreUsers.value = next
    bindingPending.value = false
  },
  { immediate: true }
)

const bindingAdminIds = computed(() => {
  const raw = bindingApp.value?.admin_ids
  if (!Array.isArray(raw)) return []
  return raw.filter((id): id is string => typeof id === 'string' && id.length > 0)
})

const binding = computed(() => {
  const appId = bindingAppId.value
  const missingCore: string[] = []
  const missingUserOf: string[] = []
  const missingAdminOf: string[] = []
  const adminMissingAppUser: string[] = []
  const adminRoleMismatch: string[] = []

  if (!appId) {
    return { missingCore, missingUserOf, missingAdminOf, adminMissingAppUser, adminRoleMismatch }
  }

  const appUserById = new Map((appUsers.value ?? []).map((u) => [u.id, u]))

  for (const [id, coreUser] of coreUsers.value.entries()) {
    if (!coreUser) {
      missingCore.push(id)
      continue
    }

    const userOf = Array.isArray(coreUser.userOf) ? coreUser.userOf : []
    if (!userOf.includes(appId)) {
      missingUserOf.push(id)
    }

    const appUser = appUserById.get(id)
    if (appUser?.role === 'admin') {
      const adminOf = Array.isArray(coreUser.adminOf) ? coreUser.adminOf : []
      if (!adminOf.includes(appId)) {
        missingAdminOf.push(id)
      }
    }
  }

  for (const id of bindingAdminIds.value) {
    const appUser = appUserById.get(id)
    if (!appUser) {
      adminMissingAppUser.push(id)
      continue
    }
    if (appUser.role !== 'admin') {
      adminRoleMismatch.push(id)
    }
  }

  return { missingCore, missingUserOf, missingAdminOf, adminMissingAppUser, adminRoleMismatch }
})

const bindingTotal = computed(
  () =>
    binding.value.missingCore.length +
    binding.value.missingUserOf.length +
    binding.value.missingAdminOf.length +
    binding.value.adminMissingAppUser.length +
    binding.value.adminRoleMismatch.length
)

const bindingAppUsersCount = computed(() => appUserIds.value.length)
const bindingAdminIdsCount = computed(() => bindingAdminIds.value.length)

const {
  driftKind: appsDriftKind,
  setDriftKind: setAppsDriftKind,
  selectedField: appsSelectedField,
  driftById: appsDriftById,
  filterOptions: appsFilterOptions,
  filteredCollection: filteredApps,
} = useDevDriftFilter({
  collection: appCollection,
  runtimeModel: appModelRuntime,
})

const cards = computed(() =>
  filteredApps.value
    .map((app) => makeCard(app))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const total = computed(() =>
  isTenant ? appCollection.value.length : count.value ?? cards.value.length
)

const allAppsJsonPayload = computed(() => ({
  totalApps: appCollection.value.length,
  apps: appCollection.value,
}))

const filteredAppsDriftPayload = computed(() =>
  cards.value.map((card) => {
    const drift = appsDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      displayName: card.displayName,
      drift,
    }
  })
)

const appsDriftCopyPayload = computed(() => ({
  modelPath: 'packages/core/fireux-core/src/runtime/models/core/app.model.ts',
  driftKind: appsDriftKind.value,
  selectedField: appsSelectedField.value || null,
  totalApps: total.value,
  apps: filteredAppsDriftPayload.value,
}))

const updateAppsSelectedField = (value: string) => {
  appsSelectedField.value = value
}
</script>
