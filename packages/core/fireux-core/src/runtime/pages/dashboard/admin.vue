<template>
  <UDashboardPanel id="admin">
    <template #header>
      <LayoutsDashboardNavbar title="Admin" />
    </template>

    <template #body>
      <div class="panels-stack">
        <div class="flex flex-wrap items-center gap-2">
          <AppCardsPill
            v-if="appCard"
            :to="appCard.to"
            :thumbnail-url="appCard.thumbnailUrl"
            :display-name="appCard.displayName"
            :ecosystem="appCard.ecosystem"
            :badges="appCard.badges"
            :show-subtitle="false"
            :link="Boolean(appCard.to)"
            class="block"
          />

          <UserCardsPill
            v-if="userCard"
            v-bind="userCard"
            :show-subtitle="false"
            :link="Boolean(userCard.to)"
            class="block"
          />
        </div>

        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading app…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!app"
          title="App not available"
          description="No app data found for this environment."
          variant="subtle"
        >
          <UButton to="/" label="Go to Home" variant="soft" class="w-fit" />
        </UPageCard>

        <div v-else class="panels-masonry">
          <div class="panels-masonry__item mb-10">
            <div class="grid gap-4 md:grid-cols-2">
              <UPageCard
                title="App record"
                description="Review the canonical app record, media, admins, and public profile."
                variant="subtle"
              >
                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-if="appRecordPath"
                    :to="appRecordPath"
                    color="primary"
                    class="w-fit"
                  >
                    Open app record
                  </UButton>
                </div>
              </UPageCard>

              <UPageCard
                title="Chat"
                description="Read and reply to public conversations for this app."
                variant="subtle"
              >
                <UButton to="/dashboard/chat" color="primary" class="w-fit">
                  Open chat inbox
                </UButton>
              </UPageCard>
            </div>
          </div>

          <div class="panels-masonry__item mb-10">
            <AppCardsProfile v-if="appProfileModel" :model="appProfileModel" />
          </div>

          <AppEditAdmin />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta } from '#imports'
import { useAppProfileView } from '../../composables/fireux/firestore/core/app/utils/view/useAppProfileView'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

const { app, pending, pill: appToCard } = useApp()
const { user, pill: userToCard } = useUser()
const { model: appProfileModel } = useAppProfileView(app)

const appCard = computed(() => appToCard(app.value))
const userCard = computed(() => userToCard(user.value))
const appRecordPath = computed(() =>
  app.value?.id ? `/apps/${encodeURIComponent(app.value.id)}` : ''
)

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-admin',
    label: 'Admin',
    icon: 'i-lucide-badge-check',
    position: 'top',
    order: 10,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
