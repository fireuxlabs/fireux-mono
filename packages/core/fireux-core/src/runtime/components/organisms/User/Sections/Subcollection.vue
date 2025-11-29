<template>
  <UCard v-if="isTenant" class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Tenant Overlays</h2>
          <p class="text-xs text-gray-500">
            Users resolved from <code>/apps/{app}/users</code> merged onto core
            accounts.
          </p>
        </div>
        <UBadge variant="soft">{{ totalOverlays }} overlay(s)</UBadge>
      </div>
    </template>

    <template v-if="overlays.length">
      <div class="fx-section__grid">
        <article
          v-for="entry in overlays"
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
      No tenant overlays discovered for this runtime.
    </p>
  </UCard>

  <UCard v-else class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Tenant Overlays</h2>
          <p class="text-xs text-gray-500">
            Overlays are only available within tenant runtimes.
          </p>
        </div>
      </div>
    </template>

    <p class="fx-section__empty">
      Switch to a tenant runtime to inspect overlay data.
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

type OverlayEntry = {
  key: string
  pill: UserCard.Pill
  roleLabel: string
  details: DetailItem[]
  overlay: Record<string, unknown>
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

const overlays = computed<OverlayEntry[]>(() => {
  if (!isTenant) return []

  const list = users.value ?? []
  if (!list.length) return []

  return list
    .map((user: any) => {
      const overlay = user?.appUser
      if (!overlay) return null

      const base = pillProps(user)
      const record = user as User
      const roleLabel = overlay.role === 'admin' ? 'App Admin' : 'App Member'
      let link: RouteLocationRaw | null = base.to ?? null
      if (!link) {
        if (record?.id) {
          link = `/users/${record.id}`
        } else if (overlay.id) {
          link = `/users/${overlay.id}`
        }
      }

      const pill: UserCard.Pill = {
        ...base,
        subtitle: base.subtitle || `Role: ${overlay.role ?? 'member'}`,
        to: link,
        special: overlay.role === 'admin',
        specialIcon: 'i-lucide-star',
        specialTooltip: overlay.role === 'admin' ? 'App Admin' : undefined,
      }

      const details: DetailItem[] = [
        { label: 'Role', value: overlay.role ?? 'member' },
        { label: 'Creator', value: overlay.creator_id ?? '—', mono: true },
        { label: 'Created', value: formatTimestamp(overlay.created_at) },
        {
          label: 'Updated',
          value: formatTimestamp(overlay.updated_at ?? null),
        },
        { label: 'User ID', value: overlay.id ?? user?.id ?? '—', mono: true },
      ]

      return {
        key: overlay.id ?? user?.id ?? base.title,
        pill,
        roleLabel,
        details,
        overlay,
        user: record,
        link,
      }
    })
    .filter((entry): entry is OverlayEntry => entry !== null)
})

const totalOverlays = computed(() => overlays.value.length)
</script>
