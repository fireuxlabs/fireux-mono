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
                Compares App memberships against projected public identities.
                Membership is authoritative in <span class="font-mono">/apps/{appId}/users</span>.
              </p>
            </div>
          </div>
        </template>

        <div class="section__item space-y-3">
          <div class="text-xs text-dimmed">
            <span class="font-mono">appId</span>: {{ driftAppId || 'unknown' }} ·
            <span class="font-mono">app users</span>: {{ appUsersCount }} ·
            <span class="font-mono">admins</span>: {{ adminIdsCount }}
          </div>

          <div v-if="driftPending" class="text-sm text-dimmed">Checking…</div>

          <div v-else-if="appUsersError" class="text-sm text-warning">
            Binding check unavailable. App admin access is required.
          </div>

          <div v-else>
            <div v-if="peopleTruncated" class="mb-3 text-sm text-warning">
              The bounded check reached its 100-record result limit.
            </div>

            <div v-if="!driftTotal" class="text-sm text-success">
              No binding issues detected.
            </div>

            <div v-else class="space-y-3">
              <div v-if="drift.missingCore.length">
                <div class="text-sm font-medium">App users missing public identity</div>
                <div class="text-xs text-dimmed">
                  {{ drift.missingCore.join(', ') }}
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
                  <span class="font-mono">role</span>,
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
                  <span class="font-mono">social_links</span>
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
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: diagnose only bounded current-App identity availability.
import { computed } from 'vue'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useAppUserCollection } from '../../../composables/fireux/firestore/core/user/fetch/useAppUserCollection'
import type { AppModel } from '../../../models/core/app.model'

const props = withDefaults(defineProps<{ app?: AppModel | null }>(), { app: null })
const app = computed(() => props.app)

const { appId: configAppId } = useFireUXConfig()
const driftAppId = computed(() => configAppId)

const {
  memberships: appUsers,
  fulfilled: projectedUsers,
  pending: driftPending,
  error: appUsersError,
  truncated: peopleTruncated,
} = useAppUserCollection()

const appUserIds = computed(() =>
  (appUsers.value ?? [])
    .map((u) => (u?.id ?? '').trim())
    .filter((id): id is string => Boolean(id))
)

const projectedUserIds = computed(
  () => new Set(projectedUsers.value.map((user) => user.id))
)

const adminIds = computed(() => {
  return (appUsers.value ?? [])
    .filter((membership) => membership.role === 'admin')
    .map((membership) => membership.id)
})

const drift = computed(() => {
  const missingCore = appUserIds.value.filter(
    (id) => !projectedUserIds.value.has(id)
  )
  return { missingCore }
})

const driftTotal = computed(() => drift.value.missingCore.length)

const appUsersCount = computed(() => appUserIds.value.length)
const adminIdsCount = computed(() => adminIds.value.length)

const appModelJson = computed(() => JSON.stringify(app.value ?? null, null, 2))
</script>
