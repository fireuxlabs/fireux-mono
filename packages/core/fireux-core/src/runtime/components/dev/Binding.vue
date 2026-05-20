<template>
  <UCard variant="subtle">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-3">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Binding check (app ↔ users)
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Compares app users against core user mirrors and admin lists.
            Membership is authoritative in <span class="font-mono">/apps/{appId}/users</span>.
          </p>
        </div>

        <div v-if="showCheckAll" class="flex items-center gap-2">
          <UButton
            size="xs"
            variant="soft"
            :label="checkAll ? 'Checking all apps' : 'Check all apps'"
            @click="toggleCheckAll"
          />
        </div>
      </div>
    </template>

    <div class="space-y-3 text-sm">
      <div class="text-xs text-gray-500 dark:text-gray-400">
        <span class="font-mono">scope</span>: {{ scopeLabel }} ·
        <span class="font-mono">app users</span>: {{ bindingAppUsersCount }} ·
        <span class="font-mono">admin_ids</span>: {{ bindingAdminIdsCount }}
      </div>

      <div v-if="isPending" class="text-xs text-gray-500 dark:text-gray-400">
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
</template>

<script setup lang="ts">
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { computed, ref, watch } from 'vue'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import type { AppModel } from '../../models/core/app.model'
import type { AppUser, User } from '../../models/core/user.model'

const props = withDefaults(
  defineProps<{ app?: AppModel | null; apps?: AppModel[] | null }>(),
  { app: null, apps: null }
)

const { appId: configAppId, isTenant } = useFireUXConfig()
const bindingAppId = computed(() => configAppId ?? '')
const showCheckAll = computed(() => !isTenant && (props.apps?.length ?? 0) > 1)

const checkAll = ref(false)
const toggleCheckAll = () => {
  checkAll.value = !checkAll.value
}

watch(showCheckAll, (enabled) => {
  if (!enabled) checkAll.value = false
})

const scopeLabel = computed(() => {
  if (checkAll.value) return 'all apps'
  return bindingAppId.value || 'unknown'
})

const db = useFirestore()
const bindingPending = ref(false)
const binding = ref({
  missingCore: [] as string[],
  missingUserOf: [] as string[],
  missingAdminOf: [] as string[],
  adminMissingAppUser: [] as string[],
  adminRoleMismatch: [] as string[],
})

const bindingAppUsersCount = ref(0)
const bindingAdminIdsCount = ref(0)

const resolveAppList = () => {
  const appList = Array.isArray(props.apps) && props.apps.length
    ? props.apps
    : props.app
      ? [props.app]
      : []

  if (!checkAll.value) {
    const active = appList.find((item) => item?.id === bindingAppId.value)
    return active ? [active] : appList.slice(0, 1)
  }

  return appList
}

const prefixId = (appId: string, uid: string) =>
  checkAll.value ? `${appId} · ${uid}` : uid

const loadBinding = async () => {
  if (import.meta.server) return

  const targets = resolveAppList().filter((app): app is AppModel => Boolean(app?.id))
  if (!targets.length) return

  bindingPending.value = true

  const missingCore: string[] = []
  const missingUserOf: string[] = []
  const missingAdminOf: string[] = []
  const adminMissingAppUser: string[] = []
  const adminRoleMismatch: string[] = []

  bindingAppUsersCount.value = 0
  bindingAdminIdsCount.value = 0

  const appUsersByApp = new Map<string, AppUser[]>()
  const userIds = new Set<string>()

  for (const app of targets) {
    const appId = app.id
    const adminIds = Array.isArray(app.admin_ids) ? app.admin_ids : []
    bindingAdminIdsCount.value += adminIds.length

    const snap = await getDocs(collection(db, 'apps', appId, 'users'))
    const users = snap.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as AppUser),
    }))

    appUsersByApp.set(appId, users)
    bindingAppUsersCount.value += users.length
    users.forEach((u) => userIds.add(u.id))
  }

  const coreUsers = new Map<string, User | null>()
  await Promise.all(
    Array.from(userIds).map(async (id) => {
      try {
        const snap = await getDoc(doc(db, 'users', id) as any)
        coreUsers.set(id, snap.exists() ? (snap.data() as User) : null)
      } catch {
        coreUsers.set(id, null)
      }
    })
  )

  for (const app of targets) {
    const appId = app.id
    const appUsers = appUsersByApp.get(appId) ?? []
    const adminIds = Array.isArray(app.admin_ids) ? app.admin_ids : []
    const appUserById = new Map(appUsers.map((u) => [u.id, u]))

    for (const appUser of appUsers) {
      const coreUser = coreUsers.get(appUser.id) ?? null
      if (!coreUser) {
        missingCore.push(prefixId(appId, appUser.id))
        continue
      }

      const userOf = Array.isArray(coreUser.userOf) ? coreUser.userOf : []
      if (!userOf.includes(appId)) {
        missingUserOf.push(prefixId(appId, appUser.id))
      }

      if (appUser.role === 'admin') {
        const adminOf = Array.isArray(coreUser.adminOf) ? coreUser.adminOf : []
        if (!adminOf.includes(appId)) {
          missingAdminOf.push(prefixId(appId, appUser.id))
        }
      }
    }

    for (const id of adminIds) {
      const appUser = appUserById.get(id)
      if (!appUser) {
        adminMissingAppUser.push(prefixId(appId, id))
        continue
      }
      if (appUser.role !== 'admin') {
        adminRoleMismatch.push(prefixId(appId, id))
      }
    }
  }

  binding.value = {
    missingCore,
    missingUserOf,
    missingAdminOf,
    adminMissingAppUser,
    adminRoleMismatch,
  }

  bindingPending.value = false
}

watch(
  [() => props.apps, () => props.app, bindingAppId, checkAll],
  () => void loadBinding(),
  { immediate: true }
)

const bindingTotal = computed(
  () =>
    binding.value.missingCore.length +
    binding.value.missingUserOf.length +
    binding.value.missingAdminOf.length +
    binding.value.adminMissingAppUser.length +
    binding.value.adminRoleMismatch.length
)

const isPending = computed(() => bindingPending.value)
</script>
