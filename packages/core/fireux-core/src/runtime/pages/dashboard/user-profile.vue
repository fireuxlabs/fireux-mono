<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: consume the profile editor's Nuxt UI columns contract. -->
<!-- Concurrent edit — 2026-07-21 15:42 CEST — User Profile polish: centre the shared route on a real public identity preview and focused editor. -->
<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: include biography in the shared profile-hub contract. -->
<!-- Concurrent edit — 2026-07-21 16:58 CEST — Dashboard Family pass: isolate root User outcomes and reuse one active-user binding. -->
<!-- Concurrent edit — 2026-07-20 23:18 CEST — Active User Outcome fix: render read failures separately from missing profiles. -->
<template>
  <div class="min-h-full">
    <UDashboardPanel id="user-profile" :ui="{ body: 'lg:py-12' }">
      <template #header>
        <LayoutsDashboardNavbar title="Profile" />
      </template>

      <template #body>
        <div class="mx-auto flex w-full max-w-3xl flex-col gap-6 lg:gap-10">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <UAvatar
              :src="userCard?.avatarUrl || undefined"
              :alt="userCard?.displayName || 'Your profile'"
              size="2xl"
              class="ring-2 ring-default"
            />

            <div class="min-w-0 flex-1">
              <h1
                class="truncate text-2xl font-semibold tracking-tight text-highlighted"
              >
                {{ userCard?.displayName || 'Your profile' }}
              </h1>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <span class="text-sm text-muted">{{
                  userCard?.handle || 'No handle'
                }}</span>
                <UserAccessBadge :subscription="subscription" />
              </div>
            </div>

            <UButton
              v-if="userCard?.to"
              :to="userCard.to"
              label="Open profile"
              icon="i-lucide-external-link"
              color="neutral"
              variant="soft"
              class="shrink-0"
            />
          </div>

          <section class="space-y-5" aria-label="User editor">
            <MoleculesStateCard
              v-if="isLoading"
              entity="profile"
              kind="document"
              loading
            />

            <MoleculesStateCard
              v-else-if="userError"
              entity="profile"
              kind="document"
              state="error"
            />

            <MoleculesStateCard
              v-else-if="isMissing"
              entity="profile"
              kind="document"
              state="missing"
            />

            <ClientOnly v-else-if="resolvedUser">
              <UserEditCore :user="resolvedUser" :user-refs="userApi" />
            </ClientOnly>

            <MoleculesStateCard
              v-else
              entity="profile"
              kind="document"
              loading
            />

            <UPageCard
              v-if="profileExtensionRows.length"
              title="More about you"
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
                    <div
                      class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated"
                    >
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

          <section class="space-y-5" aria-label="Account details">
            <MoleculesStateCard
              v-if="accountOutcome === 'idle' || accountOutcome === 'pending'"
              entity="private account"
              kind="document"
              loading
            />

            <MoleculesStateCard
              v-else-if="accountOutcome === 'error'"
              entity="private account"
              kind="document"
              state="error"
              title="Private details unavailable"
              description="Your profile still works, but private account details could not be loaded."
            />

            <MoleculesStateCard
              v-else-if="accountOutcome === 'missing'"
              entity="private account"
              kind="document"
              state="missing"
              title="Private account record missing"
              description="Your profile still works, but the private account record needs to be restored."
            />

            <UPageCard
              v-else-if="account"
              title="Account"
              icon="i-lucide-shield-check"
              variant="subtle"
            >
              <dl class="divide-y divide-default text-sm">
                <div class="py-3 first:pt-0">
                  <dt
                    class="text-xs font-medium uppercase tracking-wide text-dimmed"
                  >
                    Email
                  </dt>
                  <dd class="mt-1 break-words font-medium text-highlighted">
                    {{ account.email || 'Not available' }}
                  </dd>
                </div>
                <div class="py-3">
                  <dt
                    class="text-xs font-medium uppercase tracking-wide text-dimmed"
                  >
                    Terms accepted
                  </dt>
                  <dd class="mt-1 font-medium text-highlighted">
                    {{ termsAcceptedLabel || 'Not recorded' }}
                  </dd>
                </div>
                <div class="py-3 last:pb-0">
                  <dt
                    class="text-xs font-medium uppercase tracking-wide text-dimmed"
                  >
                    Terms version
                  </dt>
                  <dd class="mt-1 font-mono text-highlighted">
                    {{ account.terms.version || 'Not recorded' }}
                  </dd>
                </div>
              </dl>

              <template #footer>
                <div class="flex justify-end">
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
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed, definePageMeta, useHead } from '#imports'
import { useDashboardNav } from '../../composables/navigation/useDashboardNav'
import { useUser } from '../../user/composables/useUser'
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
  subscription,
  appOutcome,
  coreError,
  coreOutcome,
  coreUser,
  accountOutcome,
  account,
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
  formatFirestoreTimestamp(account.value?.terms.accepted_at, {
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
