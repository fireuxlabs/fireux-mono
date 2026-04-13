<!-- FILE: packages/core/fireux-ecosystem-controller/src/runtime/pages/apps/[id].vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <div class="space-y-6">
        <AppCardsProfile
          v-if="appProfile"
          v-bind="appProfile"
          :app="currentApp"
        />

        <DevJson
          v-if="isDev && currentApp"
          :title="'App (Doc)'"
          context="App detail page · apps/[id] · app doc"
          :data="currentApp"
          :default-open="false"
        />

        <section id="users">
          <UPageCard
            title="Users"
            :description="usersDescription"
            variant="subtle"
          >
            <div class="space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex flex-wrap items-center gap-2">
                  <UButton
                    :to="filterLink('all')"
                    label="All"
                    size="xs"
                    :variant="activeFilter === 'all' ? 'solid' : 'soft'"
                  />
                  <UButton
                    :to="filterLink('admins')"
                    label="Admins"
                    size="xs"
                    :variant="activeFilter === 'admins' ? 'solid' : 'soft'"
                  />
                  <UButton
                    :to="filterLink('users')"
                    label="Users"
                    size="xs"
                    :variant="activeFilter === 'users' ? 'solid' : 'soft'"
                  />
                </div>

                <UBadge variant="subtle" color="neutral" size="xs">
                  {{ visibleCount }} / {{ totalCount }}
                </UBadge>
              </div>

              <div v-if="usersPending" class="text-sm text-dimmed">Loading users…</div>

              <div v-else class="flex flex-wrap gap-2">
                <UserCardsPill
                  v-for="card in visibleCards"
                  :key="card.id"
                  v-bind="card"
                  :link="Boolean(card.to)"
                  class="block"
                />

                <span v-if="!visibleCards.length" class="text-sm text-dimmed italic">
                  missing
                </span>
              </div>
            </div>
          </UPageCard>
        </section>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useAppFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppFetch'
import { useAppInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useAppUserCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useAppUserCollection'
import type { UserCard } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useUserInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const appId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id
  return String(raw ?? '').trim() || null
})

const { app: currentApp } = useAppFetch(appId)

const { profile: appInterface } = useAppInterface()

const appProfile = computed(() => (currentApp.value ? appInterface(currentApp.value) : null))

const { users: appUsers, pending: usersPending } = useAppUserCollection(appId)
const { pill: userToCardByValue } = useUserInterface()

type UserFilter = 'all' | 'admins' | 'users'

const activeFilter = computed<UserFilter>(() => {
  const raw = route.query.filter
  const value = Array.isArray(raw) ? raw[0] : String(raw ?? '')
  if (value === 'admins' || value === 'users') return value
  return 'all'
})

function filterLink(filter: UserFilter) {
  const query = filter === 'all' ? {} : { filter }
  return { path: `/apps/${appId.value ?? ''}`, hash: '#users', query }
}

const totalCount = computed(() => appUsers.value.length)

const filteredUsers = computed(() => {
  if (activeFilter.value === 'admins') {
    return appUsers.value.filter((u) => u.appUser?.role === 'admin')
  }
  if (activeFilter.value === 'users') {
    return appUsers.value.filter((u) => u.appUser?.role === 'user')
  }
  return appUsers.value
})

const visibleCards = computed<UserCard.Card[]>(() => {
  return filteredUsers.value
    .map((u) => userToCardByValue(u.coreUser ?? null))
    .filter((card): card is UserCard.Card => Boolean(card))
})

const visibleCount = computed(() => visibleCards.value.length)

const usersDescription = computed(() => {
  if (activeFilter.value === 'admins') return 'Admin users for this app.'
  if (activeFilter.value === 'users') return 'Non-admin users for this app.'
  return 'All users for this app.'
})
const isDev = import.meta.dev

const appName = computed(() => currentApp.value?.app_name ?? null)
const pageTitle = computed(() => appName.value ?? 'App Details')
const pageDescription = computed(() =>
  appName.value
    ? `Inspect ${appName.value}, its overlays, and related apps.`
    : 'Inspect the selected app, its overlays, and related apps.'
)

const headTitle = computed(() =>
  appName.value ? `${appName.value} · App` : 'App Details'
)

useHead({ title: headTitle })
</script>
