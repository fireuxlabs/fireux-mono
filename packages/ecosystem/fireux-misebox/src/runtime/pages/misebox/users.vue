<template>
  <UDashboardPanel id="misebox-users">
    <template #header>
      <LayoutsDashboardNavbar title="Users" />
    </template>

    <template #body>
      <div class="fx-panels-stack">
        <!-- Header pills -->
        <div class="flex flex-wrap items-center gap-2">
          <OrganismsAppCardsPill
            v-if="appCard"
            v-bind="appCard"
            :show-subtitle="false"
          />

          <OrganismsUserCardsPill
            v-if="currentUserCard"
            v-bind="currentUserCard"
            :show-subtitle="false"
          />
        </div>

        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading users…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!app"
          title="App not available"
          description="No app data found for this environment."
          variant="subtle"
        />

        <UPageCard
          v-else-if="filter !== 'admins'"
          title="Filter required"
          description="Use ?filter=admins to view admin users for this app."
          variant="subtle"
        />

        <UPageCard
          v-else
          title="Admins"
          :description="`${adminCount} admin${adminCount === 1 ? '' : 's'}`"
          variant="subtle"
        >
          <div v-if="adminsLoading" class="text-sm text-dimmed">Loading admins…</div>

          <div v-else class="flex flex-wrap gap-2">
            <OrganismsUserCardsPill
              v-for="card in adminCards"
              :key="card.id"
              v-bind="card"
            />

            <span v-if="!adminCards.length" class="text-sm text-dimmed italic">
              missing
            </span>
          </div>
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useApp } from 'fireux-core/runtime/composables/fireux/firestore/core/app/useApp'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import type { User } from 'fireux-core/runtime/models/core/user.model'
import type { UserCard } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  roles: ['admin'],
})

const route = useRoute()
const filter = computed(() => {
  const raw = route.query.filter
  return Array.isArray(raw) ? raw[0] : String(raw ?? '')
})

const { app, pending, card: appToCard } = useApp()
const { user, card: userToCard } = useUser()

const appCard = computed(() => appToCard(app.value))
const currentUserCard = computed(() => userToCard(user.value))

const adminIds = computed(() => (app.value?.admin_ids ?? []).filter(Boolean))
const adminCount = computed(() => adminIds.value.length)

const db = useFirestore()

const adminsLoading = ref(false)
const adminCards = ref<UserCard.Card[]>([])

function normalizeUser(raw: any, fallbackId: string): User {
  return {
    ...raw,
    id: raw?.id ?? fallbackId,
    display_name: raw?.display_name ?? raw?.id ?? fallbackId,
    avatar: raw?.avatar ?? '',
    handle: raw?.handle ?? '',
    email: raw?.email ?? '',
    bio: raw?.bio ?? '',
    profiles: Array.isArray(raw?.profiles) ? raw.profiles : [],
    userOf: Array.isArray(raw?.userOf) ? raw.userOf : [],
    adminOf: Array.isArray(raw?.adminOf) ? raw.adminOf : [],
  }
}

function toUserCard(userValue: User): UserCard.Card {
  return {
    id: userValue.id,
    to: `/users/${userValue.id}`,
    avatar: userValue.avatar,
    title: userValue.display_name,
    subtitle: userValue.handle ? `@${userValue.handle}` : '',
    badges: [],
    line1: userValue.email,
    line2: userValue.bio,
    line3: (userValue.profiles ?? []).join(', '),
  }
}

watch(
  adminIds,
  async (ids) => {
    adminCards.value = []

    if (import.meta.server) return
    if (!ids.length) return

    adminsLoading.value = true
    const token = Symbol('fetch')
    ;(watch as any)._miseboxUsersToken = token

    try {
      const snapshots = await Promise.all(
        ids.map((id) => getDoc(doc(db, 'users', id) as any))
      )

      if ((watch as any)._miseboxUsersToken !== token) return

      adminCards.value = snapshots
        .filter((snap) => snap.exists())
        .map((snap) => normalizeUser(snap.data(), snap.id))
        .map(toUserCard)
    } finally {
      if ((watch as any)._miseboxUsersToken === token) {
        adminsLoading.value = false
      }
    }
  },
  { immediate: true }
)
</script>
