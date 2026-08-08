<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: consume the profile editor's Nuxt UI columns contract. -->
<!-- Concurrent edit — 2026-07-21 15:42 CEST — User Profile polish: centre the shared route on a real public identity preview and focused editor. -->
<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: include biography in the shared profile-hub contract. -->
<!-- Concurrent edit — 2026-07-21 16:58 CEST — Dashboard Family pass: isolate root User outcomes and reuse one active-user binding. -->
<!-- Concurrent edit — 2026-07-22 15:11 CEST — Profile visibility pass: keep public/private sections and restore the derived access tier in the header. -->
<!-- Concurrent edit — 2026-07-20 23:18 CEST — Active User Outcome fix: render read failures separately from missing profiles. -->
<template>
  <UDashboardPanel id="user-profile">
    <template #header>
      <LayoutsDashboardNavbar title="Profile" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            :title="userCard?.displayName || 'Profile'"
            description="Manage what people can see and review the account details only you can access."
          >
            <template #headline>
              <div class="flex flex-wrap items-center gap-2">
                <span>{{ userCard?.handle || 'Your profile' }}</span>
                <UserAccessBadge :tier="accessTier" />
              </div>
            </template>

            <template #links>
              <UButton
                v-if="userCard?.to"
                :to="userCard.to"
                label="View public profile"
                icon="i-lucide-external-link"
                color="neutral"
                variant="soft"
              />
            </template>
          </UPageHeader>

          <div class="space-y-10">
            <section class="space-y-5" aria-labelledby="public-profile-section">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2
                    id="public-profile-section"
                    class="text-xl font-semibold text-highlighted"
                  >
                    Public
                  </h2>
                  <p class="mt-1 text-sm text-muted">
                    Your photo, name, handle and bio are visible across FireUX apps.
                  </p>
                </div>

                <UBadge
                  label="Visible to everyone"
                  icon="i-lucide-globe-2"
                  color="primary"
                  variant="soft"
                />
              </div>

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
            </section>

            <section class="space-y-5" aria-labelledby="private-profile-section">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2
                    id="private-profile-section"
                    class="text-xl font-semibold text-highlighted"
                  >
                    Private
                  </h2>
                  <p class="mt-1 text-sm text-muted">
                    Account details shown here are visible only to you.
                  </p>
                </div>

                <UBadge
                  label="Only you"
                  icon="i-lucide-lock-keyhole"
                  color="neutral"
                  variant="soft"
                />
              </div>

              <MoleculesStateCard
                v-if="privateOutcome === 'idle' || privateOutcome === 'pending'"
                entity="private account"
                kind="document"
                loading
              />

              <MoleculesStateCard
                v-else-if="privateOutcome === 'error'"
                entity="private account"
                kind="document"
                state="error"
                title="Private details unavailable"
                description="Your public profile still works, but private account details could not be loaded."
              />

              <MoleculesStateCard
                v-else-if="privateOutcome === 'missing'"
                entity="private account"
                kind="document"
                state="missing"
                title="Private account record missing"
                description="Your public profile still works, but the private account record needs to be restored."
              />

              <UPageCard
                v-else-if="privateUser"
                title="Account details"
                description="Sign-in and signup-agreement details that never appear on your public profile."
                icon="i-lucide-shield-check"
                variant="subtle"
              >
                <dl class="divide-y divide-default text-sm">
                  <div class="py-3 first:pt-0">
                    <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
                      Email
                    </dt>
                    <dd class="mt-1 break-words font-medium text-highlighted">
                      {{ privateUser.email || 'Not available' }}
                    </dd>
                  </div>
                  <div class="py-3">
                    <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
                      Terms accepted
                    </dt>
                    <dd class="mt-1 font-medium text-highlighted">
                      {{ termsAcceptedLabel || 'Not recorded' }}
                    </dd>
                  </div>
                  <div class="py-3 last:pb-0">
                    <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
                      Terms version
                    </dt>
                    <dd class="mt-1 font-mono text-highlighted">
                      {{ privateUser.terms.version || 'Not recorded' }}
                    </dd>
                  </div>
                </dl>

                <template #footer>
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <p class="text-sm text-muted">
                      Manage your account and current session in Settings.
                    </p>
                    <UButton
                      to="/dashboard/settings"
                      label="Settings"
                      icon="i-lucide-settings"
                      color="neutral"
                      variant="soft"
                    />
                  </div>
                </template>
              </UPageCard>

              <MoleculesStateCard
                v-else
                entity="private account"
                kind="document"
                loading
              />
            </section>
          </div>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta, useHead } from '#imports'
import { useDashboardNav } from '../../composables/fireux/app/ui/nav/useDashboardNav'
import { useUser } from '../../composables/fireux/user/useUser'
import { formatFirestoreTimestamp } from '../../utils/formatTimestamp'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-user-profile',
    label: 'Profile',
    icon: 'i-lucide-user',
    position: 'top',
    order: 30,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

useHead({ title: 'Profile' })

const userApi = useUser()
const {
  accessTier,
  appOutcome,
  coreError,
  coreOutcome,
  coreUser,
  privateOutcome,
  privateUser,
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
const termsAcceptedLabel = computed(() =>
  formatFirestoreTimestamp(privateUser.value?.terms.accepted_at, {
    fallback: '',
    locale: 'en-GB',
  })
)
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
