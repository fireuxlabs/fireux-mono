<template>
  <UCard v-if="isTenant" class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Tenant App Users</h2>
          <p class="text-xs text-gray-500">
            Users resolved from <code>/apps/{app}/users</code> alongside their
            core accounts.
          </p>
        </div>
        <UBadge variant="soft">{{ totalAppUsers }} user(s)</UBadge>
      </div>
    </template>

    <template v-if="appUserEntries.length">
      <div class="fx-section__grid">
        <article
          v-for="entry in appUserEntries"
          :key="entry.key"
          class="space-y-3 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800"
        >
          <header class="flex items-center justify-between gap-2">
            <OrganismsUserCardsPill :user="entry.pill" class="max-w-md" />
            <UBadge variant="soft">{{ entry.roleLabel }}</UBadge>
          </header>

          <OrganismsUserCardsCell
            :user="entry.user"
            :to="entry.link"
            class="max-w-md"
          />

          <dl v-if="entry.details.length" class="fx-section__grid">
            <div
              v-for="detail in entry.details"
              :key="detail.label"
              class="fx-section__item"
            >
              <dt class="fx-section__label">{{ detail.label }}</dt>
              <dd class="text-sm" :class="{ 'font-mono text-xs': detail.mono }">
                {{ detail.value }}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </template>

    <p v-else class="fx-section__empty">
      No tenant app users discovered for this runtime.
    </p>
  </UCard>

  <UCard v-else class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Tenant App Users</h2>
          <p class="text-xs text-gray-500">
            App users only exist within tenant runtimes.
          </p>
        </div>
      </div>
    </template>

    <p class="fx-section__empty">
      Switch to a tenant runtime to inspect app user data.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUserCollection } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserCollection.ts'
import type { FirebaseTimestamp } from 'fireux-core/runtime/types/firebase.ts'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { RouteLocationRaw } from 'vue-router'

type DetailItem = { label: string; value: string; mono?: boolean }

type AppUserEntry = {
  key: string
  pill: UserCard.Pill
  roleLabel: string
  details: DetailItem[]
  appUser: Record<string, unknown>
  user: User
  link: RouteLocationRaw | null
}

const { isTenant } = useFireUXConfig()
const { users } = useUserCollection()
const { pillProps } = useUserInterface()

const formatTimestamp = (value?: FirebaseTimestamp | null): string => {
  if (!value) return '—'
  const seconds = value.seconds
  const nanoseconds = value.nanoseconds ?? 0
  if (typeof seconds === 'number') {
    const date = new Date(seconds * 1000 + Math.floor(nanoseconds / 1e6))
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString()
    }
  }
  return JSON.stringify(value)
}

const appUserEntries = computed<AppUserEntry[]>(() => {
  if (!isTenant) return []

  const list = users.value ?? []
  if (!list.length) return []

  return list
    .map((user: any) => {
      const appUser = user?.appUser
      if (!appUser) return null

      const base = pillProps(user)
      const record = user as User
      const roleLabel = appUser.role === 'admin' ? 'App Admin' : 'App Member'
      let link: RouteLocationRaw | null = base.to ?? null
      if (!link) {
        if (record?.id) {
          link = `/users/${record.id}`
        } else if (appUser.id) {
          link = `/users/${appUser.id}`
        }
      }

      const pill: UserCard.Pill = {
        ...base,
        subtitle: base.subtitle || `Role: ${appUser.role ?? 'member'}`,
        to: link,
        special: appUser.role === 'admin',
        specialIcon: 'i-lucide-star',
        specialTooltip: appUser.role === 'admin' ? 'App Admin' : undefined,
      }

      const details: DetailItem[] = [
        { label: 'Role', value: appUser.role ?? 'member' },
        { label: 'Creator', value: appUser.creator_id ?? '—', mono: true },
        { label: 'Created', value: formatTimestamp(appUser.created_at) },
        {
          label: 'Updated',
          value: formatTimestamp(appUser.updated_at ?? null),
        },
        { label: 'User ID', value: appUser.id ?? user?.id ?? '—', mono: true },
      ]

      return {
        key: appUser.id ?? user?.id ?? base.title,
        pill,
        roleLabel,
        details,
        appUser,
        user: record,
        link,
      }
    })
    .filter((entry): entry is AppUserEntry => entry !== null)
})

const totalAppUsers = computed(() => appUserEntries.value.length)
</script>
