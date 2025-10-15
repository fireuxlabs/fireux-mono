<template>
  <UPage>
    <UPageHeader
      :title="headerTitle"
      :description="pageDescription"
      :badge="userId"
    />

    <UContainer class="max-w-5xl space-y-8 py-8">
      <section v-if="isLoading" class="space-y-6">
        <USkeleton class="h-36 w-full rounded-xl" />
        <div class="grid gap-6 md:grid-cols-2">
          <USkeleton class="h-56 rounded-xl" />
          <USkeleton class="h-56 rounded-xl" />
        </div>
        <USkeleton class="h-48 w-full rounded-xl" />
      </section>

      <section
        v-else-if="showMissingState"
        class="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-700"
      >
        This user is not available. The document may have been removed or you
        lack access.
      </section>

      <section v-else class="space-y-8">
        <OrganismsUserProfile v-if="profileCardUser" :user="profileCardUser" />

        <div class="grid gap-6 md:grid-cols-2">
          <UCard :ui="{ body: 'space-y-3' }" class="shadow-sm">
            <template #header>
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 font-semibold">
                  <UIcon name="i-lucide-database" /> Core document
                </div>
                <UBadge variant="soft" color="primary">
                  {{ coreStatusLabel }}
                </UBadge>
              </div>
            </template>

            <div v-if="coreUser" class="space-y-3 text-sm">
              <div class="info-row">
                <span class="info-label">Display name</span>
                <span class="info-value">{{ coreUser.display_name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ coreUser.email ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Profiles</span>
                <span class="info-value">
                  <template v-if="coreProfiles.length">
                    <span class="inline-flex flex-wrap gap-2">
                      <UBadge
                        v-for="profile in coreProfiles"
                        :key="`core-profile-${profile}`"
                        size="xs"
                        variant="subtle"
                      >
                        {{ profile }}
                      </UBadge>
                    </span>
                  </template>
                  <template v-else>—</template>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Admin of</span>
                <span class="info-value">
                  <template v-if="coreAdminOf.length">
                    <span class="inline-flex flex-wrap gap-2">
                      <UBadge
                        v-for="tenant in coreAdminOf"
                        :key="`core-admin-${tenant}`"
                        size="xs"
                        variant="outline"
                      >
                        {{ tenant }}
                      </UBadge>
                    </span>
                  </template>
                  <template v-else>—</template>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Member of</span>
                <span class="info-value">
                  <template v-if="coreUserOf.length">
                    <span class="inline-flex flex-wrap gap-2">
                      <UBadge
                        v-for="tenant in coreUserOf"
                        :key="`core-member-${tenant}`"
                        size="xs"
                        variant="outline"
                      >
                        {{ tenant }}
                      </UBadge>
                    </span>
                  </template>
                  <template v-else>—</template>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Created</span>
                <span class="info-value">{{ coreCreatedAt ?? 'Unknown' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Updated</span>
                <span class="info-value">{{ coreUpdatedAt ?? '—' }}</span>
              </div>
              <div
                v-if="coreSchemaIssues.length"
                class="rounded-lg border border-amber-300/80 bg-amber-100/70 p-3 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
              >
                <p class="font-semibold">Schema warnings</p>
                <ul class="mt-1 list-disc space-y-1 pl-4">
                  <li v-for="issue in coreSchemaIssues" :key="issue">
                    {{ issue }}
                  </li>
                </ul>
              </div>
            </div>

            <p
              v-else
              class="rounded-lg border border-dashed border-gray-200 p-4 text-xs text-gray-500 dark:border-gray-800"
            >
              No core user document found.
            </p>
          </UCard>

          <UCard :ui="{ body: 'space-y-3' }" class="shadow-sm">
            <template #header>
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 font-semibold">
                  <UIcon name="i-lucide-layer" /> App document
                </div>
                <UBadge variant="soft" color="gray">
                  {{ appStatusLabel }}
                </UBadge>
              </div>
            </template>

            <div v-if="appUser" class="space-y-3 text-sm">
              <div class="info-row">
                <span class="info-label">Display name</span>
                <span class="info-value">{{ appUser.display_name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ appUser.email ?? '—' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Role</span>
                <span class="info-value">{{ appUser.role ?? 'user' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Profiles</span>
                <span class="info-value">
                  <template v-if="appProfiles.length">
                    <span class="inline-flex flex-wrap gap-2">
                      <UBadge
                        v-for="profile in appProfiles"
                        :key="`app-profile-${profile}`"
                        size="xs"
                        variant="subtle"
                      >
                        {{ profile }}
                      </UBadge>
                    </span>
                  </template>
                  <template v-else>—</template>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Created</span>
                <span class="info-value">{{ appCreatedAt ?? 'Unknown' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Updated</span>
                <span class="info-value">{{ appUpdatedAt ?? '—' }}</span>
              </div>
              <div
                v-if="appSchemaIssues.length"
                class="rounded-lg border border-amber-300/80 bg-amber-100/70 p-3 text-xs text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100"
              >
                <p class="font-semibold">Schema warnings</p>
                <ul class="mt-1 list-disc space-y-1 pl-4">
                  <li v-for="issue in appSchemaIssues" :key="issue">
                    {{ issue }}
                  </li>
                </ul>
              </div>
            </div>

            <p
              v-else
              class="rounded-lg border border-dashed border-gray-200 p-4 text-xs text-gray-500 dark:border-gray-800"
            >
              No app overlay exists for this user.
            </p>
          </UCard>
        </div>

        <UCard :ui="{ body: 'space-y-4' }" class="shadow-sm">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 font-semibold">
                <UIcon name="i-lucide-code-2" /> Raw documents
              </div>
              <div class="flex items-center gap-2">
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-copy"
                  :disabled="!coreRawJson"
                  @click="copyCoreJson"
                >
                  Copy core
                </UButton>
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-copy"
                  :disabled="!appRawJson"
                  @click="copyAppJson"
                >
                  Copy app
                </UButton>
              </div>
            </div>
          </template>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <h3 class="text-sm font-semibold text-gray-400">core-users/{{
                userId
              }}</h3>
              <pre class="mt-2 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
{{ coreRaw }}
              </pre>
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-400">
                {{ appDocPath ?? 'apps/<appId>/users/' + userId }}
              </h3>
              <pre class="mt-2 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
{{ appRaw }}
              </pre>
            </div>
          </div>
        </UCard>
      </section>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from 'nuxt/app'
import { useRoute } from 'vue-router'
import { useFireUXConfig } from '../../composables/FireUXConfig'
import { useFirestoreRead } from '../../composables/firestore/useFirestoreRead'
import {
  coerceFirestoreTimestamp,
  formatFirestoreTimestamp,
} from '../../utils/formatTimestamp'
import type {
  CoreUserDoc,
  AppUserDoc,
  UserCard,
} from '../../models/core/user.model'
import OrganismsUserProfile from '../../components/organisms/User/Profile.vue'

const route = useRoute()
const rawId = route.params.id
const userId = Array.isArray(rawId) ? rawId[0] : String(rawId ?? '')

const { role, appId } = useFireUXConfig()
const { firestoreFetchDoc } = useFirestoreRead()

const coreRef = userId ? firestoreFetchDoc<CoreUserDoc>('core-users', userId) : null
const appRef =
  userId && role === 'tenant' && appId
    ? firestoreFetchDoc<AppUserDoc>(`apps/${appId}/users`, userId)
    : null

const coreDocState = computed<CoreUserDoc | null | undefined>(() => coreRef?.value)
const appDocState = computed<AppUserDoc | null | undefined>(() => appRef?.value)

const coreUser = computed<CoreUserDoc | null>(() =>
  coreDocState.value === undefined ? null : coreDocState.value ?? null
)
const appUser = computed<AppUserDoc | null>(() =>
  appDocState.value === undefined ? null : appDocState.value ?? null
)

const coreLoading = computed(() => !!coreRef && coreDocState.value === undefined)
const appLoading = computed(() => !!appRef && appDocState.value === undefined)
const isLoading = computed(() => coreLoading.value || appLoading.value)

const hasAnyRecord = computed(() => Boolean(coreUser.value || appUser.value))
const showMissingState = computed(
  () => !isLoading.value && !hasAnyRecord.value
)

const mergedUser = computed(() => {
  const core = coreDocState.value
  const app = appDocState.value
  if (!core && !app) return null
  const base: Record<string, unknown> = { id: userId }
  if (core) Object.assign(base, core)
  if (app) Object.assign(base, app)
  return {
    ...base,
    core: core ?? null,
    app: app ?? null,
  }
})

const displayName = computed(() =>
  (appUser.value?.display_name || coreUser.value?.display_name || userId || 'User').trim()
)

const headerTitle = computed(() => displayName.value || 'User details')
const pageDescription = computed(() =>
  coreUser.value?.email || appUser.value?.email || 'Inspect FireUX user records.'
)

const profileCardUser = computed<UserCard.Profile | null>(() => {
  if (!mergedUser.value) return null
  const payload: any = mergedUser.value
  return {
    id: userId,
    display_name: String(
      payload.display_name || payload.handle || payload.email || userId
    ),
    avatar: payload.avatar ?? undefined,
    profiles: payload.profiles ?? undefined,
    created_at:
      payload.created_at ?? payload.core?.created_at ?? payload.app?.created_at,
    updated_at:
      payload.updated_at ?? payload.core?.updated_at ?? payload.app?.updated_at,
  }
})

const coreProfiles = computed(() => coreUser.value?.profiles ?? [])
const appProfiles = computed(() => appUser.value?.profiles ?? [])
const coreAdminOf = computed(() => coreUser.value?.adminOf ?? [])
const coreUserOf = computed(() => coreUser.value?.userOf ?? [])

const coreRequiredFields = ['id', 'display_name', 'avatar', 'created_at'] as const
const coreAllowedFields = new Set<string>([
  ...coreRequiredFields,
  'handle',
  'email',
  'userOf',
  'adminOf',
  'profiles',
  'updated_at',
])
const appRequiredFields = ['id', 'display_name', 'avatar', 'created_at'] as const
const appAllowedFields = new Set<string>([
  ...appRequiredFields,
  'handle',
  'email',
  'role',
  'profiles',
  'updated_at',
])

const coreCreatedAt = computed(() =>
  formatFirestoreTimestamp(coreUser.value?.created_at)
)
const coreUpdatedAt = computed(() =>
  formatFirestoreTimestamp(coreUser.value?.updated_at)
)
const appCreatedAt = computed(() =>
  formatFirestoreTimestamp(appUser.value?.created_at)
)
const appUpdatedAt = computed(() =>
  formatFirestoreTimestamp(appUser.value?.updated_at)
)

const coreSchemaIssues = computed(() => {
  const doc = coreDocState.value
  if (!doc) return []
  return validateSchemaRecord(doc as Record<string, any>, {
    scope: 'core',
    required: coreRequiredFields,
    allowed: coreAllowedFields,
    stringFields: ['id', 'display_name', 'avatar', 'handle', 'email'],
    stringArrayFields: ['profiles', 'adminOf', 'userOf'],
    timestampFields: ['created_at', 'updated_at'],
    routeId: userId,
  })
})

const appSchemaIssues = computed(() => {
  const doc = appDocState.value
  if (!doc) return []
  return validateSchemaRecord(doc as Record<string, any>, {
    scope: 'app',
    required: appRequiredFields,
    allowed: appAllowedFields,
    stringFields: ['id', 'display_name', 'avatar', 'handle', 'email'],
    stringArrayFields: ['profiles'],
    timestampFields: ['created_at', 'updated_at'],
    routeId: userId,
    enumFields: [{ field: 'role', values: ['user', 'admin'] }],
  })
})

const coreRawJson = computed(() =>
  coreDocState.value ? JSON.stringify(coreDocState.value, null, 2) : null
)
const appRawJson = computed(() =>
  appDocState.value ? JSON.stringify(appDocState.value, null, 2) : null
)

const coreRaw = computed(() => {
  if (coreDocState.value === undefined) return 'Loading…'
  return coreRawJson.value ?? '—'
})
const appRaw = computed(() => {
  if (appDocState.value === undefined) return 'Loading…'
  return appRawJson.value ?? '—'
})
const appDocPath = computed(() =>
  role === 'tenant' && appId ? `apps/${appId}/users/${userId}` : null
)

useHead({
  title: computed(() => (displayName.value ? `${displayName.value} · User` : 'User details')),
})

const coreStatusLabel = computed(() => {
  if (!coreRef) return 'Unavailable'
  if (coreDocState.value === undefined) return 'Loading…'
  return coreUser.value ? 'Loaded' : 'Missing'
})
const appStatusLabel = computed(() => {
  if (!appRef) return 'Unavailable'
  if (appDocState.value === undefined) return 'Loading…'
  return appUser.value ? 'Loaded' : 'Missing'
})

function copyToClipboard(text: string | null) {
  if (!text) return
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  navigator.clipboard.writeText(text)
}

function copyCoreJson() {
  copyToClipboard(coreRawJson.value)
}

function copyAppJson() {
  copyToClipboard(appRawJson.value)
}

type SchemaScope = 'core' | 'app'

interface SchemaValidationConfig {
  scope: SchemaScope
  required: readonly string[]
  allowed: Set<string>
  stringFields: readonly string[]
  stringArrayFields: readonly string[]
  timestampFields: readonly string[]
  routeId: string
  enumFields?: Array<{ field: string; values: readonly string[] }>
}

function validateSchemaRecord(
  record: Record<string, any>,
  config: SchemaValidationConfig
): string[] {
  const issues: string[] = []

  issues.push(
    ...collectMissingFields(record, config.required, config.scope)
  )
  issues.push(
    ...collectUnexpectedFields(record, config.allowed, config.scope)
  )
  issues.push(
    ...collectStringFieldIssues(record, config.stringFields, config.scope)
  )
  issues.push(
    ...collectArrayStringIssues(record, config.stringArrayFields, config.scope)
  )
  issues.push(
    ...collectTimestampIssues(record, config.timestampFields, config.scope)
  )

  if (typeof record.id === 'string' && record.id !== config.routeId) {
    issues.push(
      `Field "id" on ${config.scope} doc does not match route id (expected "${config.routeId}").`
    )
  }

  if (config.enumFields) {
    issues.push(...collectEnumIssues(record, config.enumFields, config.scope))
  }

  return issues
}

function collectMissingFields(
  record: Record<string, any>,
  fields: readonly string[],
  scope: SchemaScope
) {
  return fields
    .filter((field) => record[field] === undefined || record[field] === null)
    .map((field) => `Missing required field "${field}" on ${scope} doc.`)
}

function collectUnexpectedFields(
  record: Record<string, any>,
  allowed: Set<string>,
  scope: SchemaScope
) {
  return Object.keys(record)
    .filter((key) => !allowed.has(key))
    .map((key) => `Unexpected field "${key}" present on ${scope} doc.`)
}

function collectStringFieldIssues(
  record: Record<string, any>,
  fields: readonly string[],
  scope: SchemaScope
) {
  return fields
    .filter((field) => {
      const value = record[field]
      return value !== undefined && value !== null && typeof value !== 'string'
    })
    .map((field) => `Field "${field}" should be a string on ${scope} doc.`)
}

function collectArrayStringIssues(
  record: Record<string, any>,
  fields: readonly string[],
  scope: SchemaScope
) {
  const issues: string[] = []
  for (const field of fields) {
    const value = record[field]
    if (value === undefined || value === null) continue
    if (!Array.isArray(value)) {
      issues.push(
        `Field "${field}" should be an array of strings on ${scope} doc.`
      )
      continue
    }
    if (value.some((item) => typeof item !== 'string')) {
      issues.push(
        `Field "${field}" contains non-string entries on ${scope} doc.`
      )
    }
  }
  return issues
}

function collectTimestampIssues(
  record: Record<string, any>,
  fields: readonly string[],
  scope: SchemaScope
) {
  return fields
    .filter((field) => record[field] !== undefined && record[field] !== null)
    .filter((field) => !coerceFirestoreTimestamp(record[field]))
    .map(
      (field) =>
        `Field "${field}" is not a valid Firestore timestamp on ${scope} doc.`
    )
}

function collectEnumIssues(
  record: Record<string, any>,
  enums: Array<{ field: string; values: readonly string[] }>,
  scope: SchemaScope
) {
  const issues: string[] = []
  for (const { field, values } of enums) {
    const value = record[field]
    if (value === undefined || value === null) continue
    if (!values.includes(value)) {
      issues.push(
        `Field "${field}" has unsupported value "${value}" on ${scope} doc.`
      )
    }
  }
  return issues
}
</script>

<style scoped>
.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ui-text-muted, rgb(156, 163, 175));
}

.info-value {
  font-size: 0.9rem;
  color: var(--ui-text, rgb(31, 41, 55));
}
</style>
