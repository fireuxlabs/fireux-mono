<!-- FILE: packages/core/fireux-core/src/runtime/pages/users/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Users"
      description="See the signed-in user, tenant overlays, and the directory of users available to this runtime."
    />

    <UPageBody class="space-y-6">
      <!-- Signed-in core user -->
      <UCard>
        <template #header><h2>Signed-in User</h2></template>
        <template v-if="corePill">
          <div class="space-y-3">
            <MoleculesPill v-bind="corePill" class="max-w-md" />
            <dl
              v-if="coreDetails.length"
              class="grid gap-3 text-sm sm:grid-cols-2"
            >
              <div
                v-for="detail in coreDetails"
                :key="detail.label"
                class="flex items-center gap-2"
              >
                <dt class="opacity-70">{{ detail.label }}</dt>
                <dd
                  class="text-sm"
                  :class="{ 'font-mono text-xs': detail.mono }"
                >
                  {{ detail.value }}
                </dd>
              </div>
            </dl>
            <pre class="text-xs whitespace-pre-wrap">{{ coreUser }}</pre>
          </div>
        </template>
        <p v-else class="text-sm opacity-70">
          No core user loaded (not signed in?).
        </p>
      </UCard>

      <!-- App overlay user -->
      <UCard>
        <template #header><h2>App Overlay</h2></template>
        <template v-if="appPill">
          <div class="space-y-3">
            <MoleculesPill v-bind="appPill" class="max-w-md" />
            <dl
              v-if="appDetails.length"
              class="grid gap-3 text-sm sm:grid-cols-2"
            >
              <div
                v-for="detail in appDetails"
                :key="detail.label"
                class="flex items-center gap-2"
              >
                <dt class="opacity-70">{{ detail.label }}</dt>
                <dd
                  class="text-sm"
                  :class="{ 'font-mono text-xs': detail.mono }"
                >
                  {{ detail.value }}
                </dd>
              </div>
            </dl>
            <pre class="text-xs whitespace-pre-wrap">{{ appUser }}</pre>
          </div>
        </template>
        <p v-else-if="isTenant" class="text-sm opacity-70">
          No app user for this app (or no app selected).
        </p>
        <p v-else class="text-sm opacity-70">
          App overlays apply only in tenant apps; global mode skips this layer.
        </p>
      </UCard>

      <!-- Directory -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2>User Directory</h2>
            <UBadge variant="soft">{{ totalUsers }} total</UBadge>
          </div>
        </template>

        <div
          v-if="directoryPills.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <MoleculesPill
            v-for="pill in directoryPills"
            :key="pill.title + (pill.subtitle || '')"
            v-bind="pill"
          />
        </div>

        <p v-else class="text-sm opacity-70">No users found.</p>
      </UCard>

      <!-- Raw snapshots -->
      <UCard>
        <template #header><h2>Raw Snapshots</h2></template>
        <div class="grid gap-4 text-xs md:grid-cols-2">
          <div>
            <h3 class="text-xs font-semibold uppercase opacity-60">
              Core User
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{ coreUser }}</pre>
          </div>
          <div>
            <pre class="mt-2 whitespace-pre-wrap">{{ userList }}</pre>
            <pre class="mt-2 whitespace-pre-wrap">{{ appUser }}</pre>
          </div>
          <div class="md:col-span-2">
            <h3 class="text-xs font-semibold uppercase opacity-60">
              Users Collection
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{ users }}</pre>
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useUserCollection } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserCollection.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import type { FirebaseTimestamp } from 'fireux-core/runtime/types/firebase.ts'

type PillProps = Pill.Props

// Full page meta (nav + SEO)
declare function definePageMeta(meta: any): void

definePageMeta({
  nav: {
    key: 'users',
    label: 'Users',
    icon: 'i-lucide-users',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Users',
  description: 'FireUX user accounts resolved for this runtime.',
  layout: 'default',
  name: 'UsersIndexPage',
})

const { isTenant } = useFireUXConfig()
const { coreUser, appUser, pillProps } = useUser()
const { users } = useUserCollection()

const userList = computed(() => users.value ?? [])

const corePill = computed<PillProps | null>(() =>
  coreUser.value ? { ...pillProps(coreUser.value) } : null
)

const appPill = computed<PillProps | null>(() => {
  const overlay = appUser.value
  if (!overlay) return null

  const base = coreUser.value
  const roleBadge = overlay.role === 'admin' ? 'App Admin' : 'App Member'

  if (base) {
    const basePill = pillProps(base)
    const badges = [...(basePill.badges ?? [])]
    if (!badges.includes(roleBadge)) badges.push(roleBadge)

    return {
      ...basePill,
      subtitle: basePill.subtitle || `Role: ${overlay.role}`,
      badges,
    }
  }

  return {
    avatar: '',
    initials: 'A',
    title: overlay.id,
    subtitle: `Role: ${overlay.role}`,
    badges: [roleBadge],
    to: null,
  }
})

const directoryPills = computed<PillProps[]>(() => {
  const list = userList.value
  if (!list.length) return []

  return list.map((entry) => {
    const pill = pillProps(entry as any)
    const overlayRole = (entry as any)?.appUser?.role
    if (!overlayRole) return pill

    const badges = new Set<string>((pill.badges ?? []) as string[])
    badges.add(overlayRole === 'admin' ? 'App Admin' : 'App Member')

    return {
      ...pill,
      badges: Array.from(badges),
    }
  })
})

const totalUsers = computed(() => directoryPills.value.length)

type DetailItem = { label: string; value: string; mono?: boolean }

const formatTimestamp = (value?: FirebaseTimestamp | null): string => {
  if (!value) return '—'
  const seconds = (value as FirebaseTimestamp).seconds
  const nanoseconds = (value as FirebaseTimestamp).nanoseconds ?? 0
  if (typeof seconds === 'number') {
    const date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1e6))
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString()
    }
  }
  return JSON.stringify(value)
}

const toList = (input?: readonly string[] | null): string => {
  if (!Array.isArray(input) || input.length === 0) return '—'
  return input.join(', ')
}

const coreDetails = computed<DetailItem[]>(() => {
  const user = coreUser.value
  if (!user) return []

  return [
    { label: 'Handle', value: user.handle ? `@${user.handle}` : '—' },
    { label: 'Email', value: user.email ?? '—' },
    { label: 'Profiles', value: toList(user.profiles) },
    { label: 'Admin Of', value: toList(user.adminOf) },
    { label: 'User Of', value: toList(user.userOf) },
    { label: 'Created', value: formatTimestamp(user.created_at) },
    { label: 'Updated', value: formatTimestamp(user.updated_at ?? null) },
    { label: 'User ID', value: user.id, mono: true },
  ]
})

const appDetails = computed<DetailItem[]>(() => {
  const overlay = appUser.value
  if (!overlay) return []

  return [
    { label: 'Role', value: overlay.role ?? 'member' },
    { label: 'Creator', value: overlay.creator_id ?? '—', mono: true },
    { label: 'Created', value: formatTimestamp(overlay.created_at) },
    { label: 'Updated', value: formatTimestamp(overlay.updated_at ?? null) },
    { label: 'User ID', value: overlay.id ?? '', mono: true },
  ].filter((detail) => detail.value !== '' || detail.mono !== true)
})
</script>
