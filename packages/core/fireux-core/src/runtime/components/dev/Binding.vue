<template>
  <UCard variant="subtle">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-3">
          <p class="text-sm font-semibold text-highlighted">
            Binding check (app ↔ users)
          </p>
          <p class="text-xs text-muted">
            Compares App memberships against ecosystem identity mirrors.
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
      <div class="text-xs text-muted">
        <span class="font-mono">scope</span>: {{ scopeLabel }} ·
        <span class="font-mono">app users</span>: {{ bindingAppUsersCount }} ·
        <span class="font-mono">admins</span>: {{ bindingAdminIdsCount }}
      </div>

      <div v-if="isPending" class="text-xs text-muted">
        Checking…
      </div>

      <div v-else>
        <div v-if="!bindingTotal" class="text-sm text-success">
          No binding issues detected.
        </div>

        <div v-else class="space-y-3">
          <div v-if="binding.missingCore.length">
            <div class="text-sm font-medium">App users missing core user docs</div>
            <div class="text-xs text-muted">
              {{ binding.missingCore.join(', ') }}
            </div>
          </div>

          <div v-if="binding.missingAppIds.length">
            <div class="text-sm font-medium">Public users missing app id</div>
            <div class="text-xs text-muted">
              {{ binding.missingAppIds.join(', ') }}
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
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { AppStorage, type AppModel } from '../../models/core/app.model'
import {
  UserAppStorage,
  UserStorage,
  type UserApp,
  type User,
} from '../../models/core/user.model'

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

watch(showCheckAll, (enabled: boolean) => {
  if (!enabled) checkAll.value = false
})

const scopeLabel = computed(() => {
  if (checkAll.value) return 'all apps'
  return bindingAppId.value || 'unknown'
})

const appDb = useFirestore()
const identityDb = useFirestore(readRuntimeIdentityFirestoreDatabaseId())
const bindingPending = ref(false)
const binding = ref({
  missingCore: [] as string[],
  missingAppIds: [] as string[],
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
  const missingAppIds: string[] = []
  bindingAppUsersCount.value = 0
  bindingAdminIdsCount.value = 0

  const appUsersByApp = new Map<string, UserApp[]>()
  const userIds = new Set<string>()

  for (const app of targets) {
    const appId = app.id
    const snap = await getDocs(
      collection(appDb, AppStorage.collection, appId, UserAppStorage.collection)
    )
    const users = snap.docs.map((docSnap) => ({
      ...(docSnap.data() as UserApp),
      id: docSnap.id,
    }))

    appUsersByApp.set(appId, users)
    bindingAppUsersCount.value += users.length
    bindingAdminIdsCount.value += users.filter((user) => user.role === 'admin').length
    users.forEach((u) => userIds.add(u.id))
  }

  const coreUsers = new Map<string, User | null>()
  await Promise.all(
    Array.from(userIds).map(async (id) => {
      try {
        const snap = await getDoc(doc(identityDb, UserStorage.rootCollection, id) as any)
        coreUsers.set(id, snap.exists() ? (snap.data() as User) : null)
      } catch {
        coreUsers.set(id, null)
      }
    })
  )

  for (const app of targets) {
    const appId = app.id
    const appUsers = appUsersByApp.get(appId) ?? []

    for (const appUser of appUsers) {
      const coreUser = coreUsers.get(appUser.id) ?? null
      if (!coreUser) {
        missingCore.push(prefixId(appId, appUser.id))
        continue
      }

      const appIds = Array.isArray(coreUser.app_ids) ? coreUser.app_ids : []
      if (!appIds.includes(appId)) {
        missingAppIds.push(prefixId(appId, appUser.id))
      }
    }
  }

  binding.value = {
    missingCore,
    missingAppIds,
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
    binding.value.missingAppIds.length
)

const isPending = computed(() => bindingPending.value)
</script>
