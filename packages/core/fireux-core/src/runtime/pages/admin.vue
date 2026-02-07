<!-- FILE: packages/core/fireux-core/src/runtime/pages/admin.vue -->
<template>
  <UDashboardPanel id="admin">
    <template #header>
      <LayoutsDashboardNavbar title="Admin" />
    </template>

    <template #body>
      <div class="panels-stack">
        <!-- Header pills -->
        <div class="flex flex-wrap items-center gap-2">
          <OrganismsAppCardsPill
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

          <OrganismsUserCardsPill
            v-if="userCard"
            v-bind="userCard"
            :show-subtitle="false"
            :link="Boolean(userCard.to)"
            class="block"
          />
        </div>

        <!-- Loading -->
        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading app…</p>
        </UPageCard>

        <!-- Missing app -->
        <UPageCard
          v-else-if="!app"
          title="App not available"
          description="No app data found for this environment."
          variant="subtle"
        >
          <UButton to="/" label="Go to Home" variant="soft" class="w-fit" />
        </UPageCard>

        <!-- Main panels -->
        <div v-else class="panels-masonry">
          <div class="panels-masonry__item mb-10">
            <div class="grid gap-4 md:grid-cols-2">
              <UPageCard
                title="Products"
                description="Create and manage your product catalog."
                variant="subtle"
              >
                <div class="flex flex-wrap gap-2">
                  <UButton to="/admin/products" color="primary" class="w-fit">
                    View products
                  </UButton>
                  <UButton to="/admin/products/create" variant="soft" class="w-fit">
                    Create product
                  </UButton>
                  <UButton to="/admin/licenses" variant="outline" class="w-fit">
                    Template licenses
                  </UButton>
                </div>
              </UPageCard>

              <UPageCard
                title="Blog"
                description="Publish updates and announcements."
                variant="subtle"
              >
                <div class="flex flex-wrap gap-2">
                  <UButton to="/admin/blogs" color="primary" class="w-fit">
                    View posts
                  </UButton>
                  <UButton to="/admin/blogs/create" variant="soft" class="w-fit">
                    Create post
                  </UButton>
                </div>
              </UPageCard>
            </div>
          </div>

          <div class="panels-masonry__item mb-10">
            <OrganismsAppCardsProfile
              v-if="appCard"
              v-bind="appCard"
              :app="app"
            />
          </div>

          <OrganismsAppEditAdmin />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta } from '#imports'
import { useApp } from '../composables/fireux/firestore/core/app/useApp'
import { useUser } from '../composables/fireux/firestore/core/user/useUser'

const { app, pending, card: appToCard } = useApp()
const { user, card: userToCard } = useUser()

// Reactive mapping lives in the consumer (simple + explicit)
const appCard = computed(() => appToCard(app.value))
const userCard = computed(() => userToCard(user.value))

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'admin',
    label: 'Admin',
    icon: 'i-lucide-badge-check',
    order: 10,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
