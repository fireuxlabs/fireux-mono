<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Signed-in User</h2>
          <p class="text-xs text-gray-500">
            Core account resolved from the authenticated session.
          </p>
        </div>
        <UBadge v-if="coreDetailCount" variant="soft">
          {{ coreDetailCount }} field(s)
        </UBadge>
      </div>
    </template>

    <template v-if="current">
      <MoleculesPill
        v-if="corePill"
        v-bind="corePill"
        class="max-w-md"
        @click.capture="logPill('core', corePill)"
      />
      <OrganismsUserCardsCell :user="current" :to="coreLink" class="max-w-md" />

      <dl v-if="coreDetails.length" class="fx-section__grid sm:grid-cols-2">
        <div
          v-for="detail in coreDetails"
          :key="detail.label"
          class="fx-section__item"
        >
          <dt class="fx-section__label">{{ detail.label }}</dt>
          <dd class="text-sm" :class="{ 'font-mono text-xs': detail.mono }">
            {{ detail.value }}
          </dd>
        </div>
      </dl>

      <section v-if="isTenant" class="fx-section__item">
        <header class="flex items-center justify-between gap-2">
          <h3 class="fx-section__label font-semibold">Tenant Overlay</h3>
          <UBadge v-if="overlay" variant="soft">{{ overlayRole }}</UBadge>
        </header>

        <template v-if="overlay">
          <MoleculesPill
            v-if="overlayPill"
            v-bind="overlayPill"
            class="mt-3 max-w-md"
            @click.capture="logPill('overlay', overlayPill)"
          />

          <dl v-if="overlayDetails.length" class="mt-3 fx-section__grid">
            <div
              v-for="detail in overlayDetails"
              :key="detail.label"
              class="fx-section__item"
            >
              <dt class="fx-section__label">{{ detail.label }}</dt>
              <dd class="text-sm" :class="{ 'font-mono text-xs': detail.mono }">
                {{ detail.value }}
              </dd>
            </div>
          </dl>
        </template>

        <p v-else class="mt-3 text-sm text-gray-500 dark:text-slate-400">
          No overlay data found for this user.
        </p>
      </section>
    </template>

    <p v-else class="fx-section__empty">No signed-in user loaded.</p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import type { FirebaseTimestamp } from 'fireux-core/runtime/types/firebase.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'
import type { RouteLocationRaw } from 'vue-router'

type DetailItem = { label: string; value: string; mono?: boolean }

const { isTenant } = useFireUXConfig()
const { coreUser, appUser, pillProps } = useUser()

const current = computed(() => coreUser.value ?? null)
const overlay = computed(() => appUser.value ?? null)

const corePill = computed<Pill.Props | null>(() =>
  current.value ? { ...pillProps(current.value) } : null
)

const coreLink = computed<RouteLocationRaw | null>(() => {
  if (corePill.value?.to) return corePill.value.to
  const id = current.value?.id
  return id ? `/users/${id}` : null
})

const overlayRole = computed(() =>
  overlay.value?.role === 'admin' ? 'App Admin' : 'App Member'
)

const overlayPill = computed<Pill.Props | null>(() => {
  const base = corePill.value
  const data = overlay.value
  if (!data) return null

  const baseLink =
    base?.to ?? (current.value?.id ? `/users/${current.value.id}` : null)

  if (base) {
    const badges = new Set<string>((base.badges ?? []) as string[])
    badges.add(overlayRole.value)

    return {
      ...base,
      subtitle: base.subtitle || `Role: ${data.role ?? 'member'}`,
      badges: Array.from(badges).filter(Boolean),
      to: baseLink,
    }
  }

  return {
    avatar: '',
    initials: 'A',
    title: data.id ?? 'User',
    subtitle: `Role: ${data.role ?? 'member'}`,
    badges: [overlayRole.value],
    to: data.id ? `/users/${data.id}` : baseLink,
  }
})

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

const toList = (input?: readonly string[] | null): string => {
  if (!Array.isArray(input) || input.length === 0) return '—'
  return input.join(', ')
}

const coreDetails = computed<DetailItem[]>(() => {
  const user = current.value
  if (!user) return []

  return [
    { label: 'Handle', value: user.handle ? `@${user.handle}` : '—' },
    { label: 'Email', value: user.email ?? '—' },
    { label: 'Profiles', value: toList(user.profiles) },
    { label: 'Admin Of', value: toList(user.adminOf) },
    { label: 'User Of', value: toList(user.userOf) },
    { label: 'Created', value: formatTimestamp(user.created_at) },
    { label: 'Updated', value: formatTimestamp(user.updated_at ?? null) },
    { label: 'User ID', value: user.id ?? '—', mono: true },
  ]
})

const overlayDetails = computed<DetailItem[]>(() => {
  const data = overlay.value
  if (!data) return []

  return [
    { label: 'Role', value: data.role ?? 'member' },
    { label: 'Creator', value: data.creator_id ?? '—', mono: true },
    { label: 'Created', value: formatTimestamp(data.created_at) },
    { label: 'Updated', value: formatTimestamp(data.updated_at ?? null) },
    { label: 'User ID', value: data.id ?? '—', mono: true },
  ]
})

const coreDetailCount = computed(() => coreDetails.value.length)

const logPill = (label: 'core' | 'overlay', payload: Pill.Props | null) => {
  if (!import.meta.dev) return
  console.debug(`[UserSection:Single] ${label} pill click`, payload)
}
</script>
