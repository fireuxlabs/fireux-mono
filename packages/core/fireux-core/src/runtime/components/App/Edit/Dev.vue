<template>
  <ClientOnly>
    <div v-if="app" class="space-y-6">
      <!-- TODO: make it easy for admins to change image without a dev -->

      <!-- Images -->
      <MoleculesFormsFirestoreAppImages :app="app" />

      <UCard class="section" variant="subtle">
        <template #header>
          <div class="section__header">
            <div class="section__copy">
              <h3>Binding check (app ↔ users)</h3>
              <p>
                Compares app users against ecosystem identity mirrors and admin lists.
                Membership is authoritative in <span class="font-mono">/apps/{appId}/users</span>.
              </p>
            </div>
          </div>
        </template>

        <div class="section__item space-y-3">
          <div class="text-xs text-dimmed">
            <span class="font-mono">appId</span>: {{ driftAppId || 'unknown' }} ·
            <span class="font-mono">app users</span>: {{ appUsersCount }} ·
            <span class="font-mono">admin_ids</span>: {{ adminIdsCount }}
          </div>

          <div v-if="driftPending" class="text-sm text-dimmed">Checking…</div>

          <div v-else>
            <div v-if="!driftTotal" class="text-sm text-success">
              No binding issues detected.
            </div>

            <div v-else class="space-y-3">
              <div v-if="drift.missingCore.length">
                <div class="text-sm font-medium">App users missing core user docs</div>
                <div class="text-xs text-dimmed">
                  {{ drift.missingCore.join(', ') }}
                </div>
              </div>

              <div v-if="drift.missingAppIds.length">
                <div class="text-sm font-medium">Public users missing app id</div>
                <div class="text-xs text-dimmed">
                  {{ drift.missingAppIds.join(', ') }}
                </div>
              </div>

              <div v-if="drift.adminMissingAppUser.length">
                <div class="text-sm font-medium">Admin ids missing app user doc</div>
                <div class="text-xs text-dimmed">
                  {{ drift.adminMissingAppUser.join(', ') }}
                </div>
              </div>

              <div v-if="drift.adminRoleMismatch.length">
                <div class="text-sm font-medium">Admin ids not marked admin in app users</div>
                <div class="text-xs text-dimmed">
                  {{ drift.adminRoleMismatch.join(', ') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="section" variant="subtle">
        <template #header>
          <div class="section__header">
            <div class="section__copy">
              <h3>Field ownership</h3>
              <p>
                Admin runs the app. Developer builds and checks it. App
                Control changes where it belongs. System owns calculated fields.
              </p>
            </div>
          </div>
        </template>

        <div class="section__item">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <div class="text-xs font-medium text-dimmed">App Control</div>
              <ul class="mt-2 space-y-1 text-sm">
                <li>
                  <span class="font-mono">project_id</span>,
                  <span class="font-mono">ecosystem_id</span>,
                  <span class="font-mono">slug</span>,
                  <span class="font-mono">status</span>
                </li>
                <li>
                  <span class="font-mono">team</span>,
                  <span class="font-mono">role</span>,
                  <span class="font-mono">ecosystem</span>
                </li>
                <li>
                  <span class="font-mono">app_name</span>,
                  <span class="font-mono">app_short_name</span>
                </li>
              </ul>
            </div>

            <div>
              <div class="text-xs font-medium text-dimmed">Developer</div>
              <ul class="mt-2 space-y-1 text-sm">
                <li>
                  <span class="font-mono">media</span>,
                  <span class="font-mono">database_id</span>
                </li>
                <li>
                  <span class="font-mono">fireux_native</span>,
                  <span class="font-mono">fireux_size</span>,
                  <span class="font-mono">fireux_repo</span>
                </li>
              </ul>
            </div>

            <div>
              <div class="text-xs font-medium text-dimmed">Admin</div>
              <ul class="mt-2 space-y-1 text-sm">
                <li>
                  <span class="font-mono">tagline</span>,
                  <span class="font-mono">description</span>
                </li>
                <li>
                  <span class="font-mono">short_bio</span>,
                  <span class="font-mono">long_bio</span>
                </li>
                <li>
                  <span class="font-mono">social_links</span>,
                  <span class="font-mono">join_requests</span>,
                  <span class="font-mono">admin_ids</span>
                </li>
              </ul>
            </div>

            <div>
              <div class="text-xs font-medium text-dimmed">System</div>
              <ul class="mt-2 space-y-1 text-sm">
                <li>
                  <span class="font-mono">id</span>,
                  <span class="font-mono">derived</span>
                </li>
                <li>
                  <span class="font-mono">created</span>,
                  <span class="font-mono">updated</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="section">
        <template #header>
          <div class="section__header">
            <div class="section__copy">
              <h3>Model</h3>
              <p>Full app document.</p>
            </div>
          </div>
        </template>

        <div class="section__item">
          <pre class="text-xs font-mono text-dimmed whitespace-pre-wrap break-words">{{ appModelJson }}</pre>
        </div>
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="developer settings" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { computed, ref, watch } from 'vue'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useAppUserCollection } from '../../../composables/fireux/firestore/core/user/fetch/useAppUserCollection'
import type { AppModel } from '../../../models/core/app.model'
import { UserStorage, type User } from '../../../models/core/user.model'

const props = withDefaults(defineProps<{ app?: AppModel | null }>(), { app: null })
const app = computed(() => props.app)

const { appId: configAppId } = useFireUXConfig()
const driftAppId = computed(() => app.value?.id ?? configAppId ?? '')

const { memberships: appUsers, pending: appUsersPending } = useAppUserCollection()
const identityDb = useFirestore(readRuntimeIdentityFirestoreDatabaseId())
const coreUsers = ref<Map<string, User | null>>(new Map())
const driftPending = ref(false)

const appUserIds = computed(() =>
  (appUsers.value ?? [])
    .map((u) => (u?.id ?? '').trim())
    .filter((id): id is string => Boolean(id))
)

watch(
  appUserIds,
  async (ids: string[]) => {
    if (import.meta.server) return
    const appId = driftAppId.value
    if (!appId) return

    driftPending.value = true
    const next = new Map<string, User | null>()

    await Promise.all(
      ids.map(async (id: string) => {
        try {
          const snap = await getDoc(doc(identityDb, UserStorage.rootCollection, id) as any)
          next.set(id, snap.exists() ? (snap.data() as User) : null)
        } catch {
          next.set(id, null)
        }
      })
    )

    coreUsers.value = next
    driftPending.value = false
  },
  { immediate: true }
)

const adminIds = computed(() => {
  const raw = app.value?.admin_ids
  if (!Array.isArray(raw)) return []
  return raw.filter((id): id is string => typeof id === 'string' && id.length > 0)
})

const drift = computed(() => {
  const appId = driftAppId.value
  const missingCore: string[] = []
  const missingAppIds: string[] = []
  const adminMissingAppUser: string[] = []
  const adminRoleMismatch: string[] = []

  if (!appId) {
    return { missingCore, missingAppIds, adminMissingAppUser, adminRoleMismatch }
  }

  const appUserById = new Map((appUsers.value ?? []).map((u) => [u.id, u]))

  for (const [id, coreUser] of coreUsers.value.entries()) {
    if (!coreUser) {
      missingCore.push(id)
      continue
    }

    const appIds = Array.isArray(coreUser.app_ids) ? coreUser.app_ids : []
    if (!appIds.includes(appId)) {
      missingAppIds.push(id)
    }
  }

  for (const id of adminIds.value) {
    const appUser = appUserById.get(id)
    if (!appUser) {
      adminMissingAppUser.push(id)
      continue
    }
    if (appUser.role !== 'admin') {
      adminRoleMismatch.push(id)
    }
  }

  return { missingCore, missingAppIds, adminMissingAppUser, adminRoleMismatch }
})

const driftTotal = computed(
  () =>
    drift.value.missingCore.length +
    drift.value.missingAppIds.length +
    drift.value.adminMissingAppUser.length +
    drift.value.adminRoleMismatch.length
)

const appUsersCount = computed(() => appUserIds.value.length)
const adminIdsCount = computed(() => adminIds.value.length)

const appModelJson = computed(() => JSON.stringify(app.value ?? null, null, 2))
</script>
