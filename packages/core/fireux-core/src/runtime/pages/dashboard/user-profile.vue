<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: consume the profile editor's Nuxt UI columns contract. -->
<!-- Concurrent edit — 2026-07-21 15:42 CEST — User Profile polish: centre the shared route on a real public identity preview and focused editor. -->
<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: include biography in the shared profile-hub contract. -->
<!-- Concurrent edit — 2026-07-21 16:58 CEST — Dashboard Family pass: isolate root User outcomes and reuse one active-user binding. -->
<template>
  <!-- Concurrent edit — 2026-07-20 23:18 CEST — Active User Outcome fix: render read failures separately from missing profiles. -->
  <UDashboardPanel id="user-profile">
    <template #header>
      <LayoutsDashboardNavbar title="Public profile" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            :headline="userCard?.handle || 'Public identity'"
            :title="userCard?.displayName || 'Public profile'"
            description="Your name, handle, photo and bio travel with you across the apps you use."
          >
            <template #links>
              <UButton
                v-if="userCard?.to"
                :to="userCard.to"
                label="View profile"
                icon="i-lucide-external-link"
                color="neutral"
                variant="soft"
              />
            </template>
          </UPageHeader>

          <div class="space-y-6">
            <MoleculesStateCard
              v-if="isLoading"
              entity="public profile"
              kind="document"
              loading
            />

            <MoleculesStateCard
              v-else-if="userError"
              entity="public profile"
              kind="document"
              state="error"
            />

            <MoleculesStateCard
              v-else-if="isMissing"
              entity="public profile"
              kind="document"
              state="missing"
            />

            <ClientOnly v-else-if="resolvedUser">
              <LayoutsDashboardProfileEdit>
                <template #preview>
                  <UserEditPreview
                    v-if="userCard"
                    :card="userCard"
                  />
                </template>

                <template #core>
                  <UserEditCore
                    :user="resolvedUser"
                    :user-refs="userApi"
                  />
                </template>
              </LayoutsDashboardProfileEdit>
            </ClientOnly>

            <MoleculesStateCard
              v-else
              entity="public profile"
              kind="document"
              loading
            />

            <UPageCard
              v-if="profileExtensionRows.length"
              title="More about you"
              description="Add a specialist profile when you want to share more than your name, handle and photo."
              icon="i-lucide-badge-plus"
              variant="subtle"
            >
              <div class="grid gap-3 sm:grid-cols-2">
                <div
                  v-for="entry in profileExtensionRows"
                  :key="entry.profileId"
                  class="flex items-center justify-between gap-3 rounded-lg border border-default bg-default px-4 py-3"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated">
                      <UIcon
                        :name="entry.icon || 'i-lucide-user'"
                        class="size-4 text-muted"
                      />
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium">
                        {{ entry.label }}
                      </p>
                      <p class="text-xs text-dimmed">
                        {{
                          entry.active ? 'Part of your profile' : 'Ready to add'
                        }}
                      </p>
                    </div>
                  </div>

                  <UButton
                    :to="entry.to"
                    :label="entry.active ? 'Open' : 'Add'"
                    color="neutral"
                    variant="soft"
                    size="xs"
                  />
                </div>
              </div>
            </UPageCard>
          </div>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta, useHead } from '#imports'
import { useDashboardNav } from '../../composables/fireux/app/ui/nav/useDashboardNav'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-user-profile',
    label: 'Public profile',
    icon: 'i-lucide-user',
    position: 'top',
    order: 30,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

useHead({ title: 'Public profile' })

const userApi = useUser()
const {
  appOutcome,
  coreError,
  coreOutcome,
  coreUser,
  profile: userInterface,
} = userApi
const { activeProfileEntries, availableProfileEntries } = useDashboardNav()

const isLoading = computed(
  () => coreOutcome.value === 'idle' || coreOutcome.value === 'pending'
)
const userError = computed(
  () => coreOutcome.value === 'error' || Boolean(coreError.value)
)
const isMissing = computed(() => coreOutcome.value === 'missing')
const resolvedUser = computed(() => coreUser.value ?? null)
const userCard = computed(() => userInterface(resolvedUser.value))
const profileExtensionRows = computed(() => {
  if (appOutcome.value !== 'ready') return []

  return [
    ...activeProfileEntries.value.map((entry) => ({ ...entry, active: true })),
    ...availableProfileEntries.value.map((entry) => ({
      ...entry,
      active: false,
    })),
  ]
})
</script>
