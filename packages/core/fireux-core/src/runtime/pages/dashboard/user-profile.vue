<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: consume the profile editor's Nuxt UI columns contract. -->
<!-- Concurrent edit — 2026-07-21 15:42 CEST — User Profile polish: centre the shared route on a real public identity preview and focused editor. -->
<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: include biography in the shared profile-hub contract. -->
<!-- Concurrent edit — 2026-07-21 16:58 CEST — Dashboard Family pass: isolate root User outcomes and reuse one active-user binding. -->
<!-- Concurrent edit — 2026-07-20 23:18 CEST — Active User Outcome fix: render read failures separately from missing profiles. -->
<template>
  <div>
    <UDashboardPanel id="user-profile">
      <template #header>
        <FireLayoutsDashboardNavbar title="Profile" />
      </template>

      <template #body>
        <div>
          <div>
            <UAvatar
              :src="userCard?.avatarUrl || undefined"
              :alt="userCard?.displayName || 'Your profile'"
              size="2xl"
            />

            <div>
              <h1>
                {{ userCard?.displayName || 'Your profile' }}
              </h1>
              <div>
                <span>{{ userCard?.handle || 'No handle' }}</span>
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
            />
          </div>

          <section aria-label="User editor">
            <FireStateCard
              v-if="isLoading"
              entity="profile"
              kind="document"
              loading
            />

            <FireStateCard
              v-else-if="userError"
              entity="profile"
              kind="document"
              state="error"
            />

            <FireStateCard
              v-else-if="isEmpty"
              entity="profile"
              kind="document"
              state="empty"
            />

            <ClientOnly v-else-if="resolvedUser">
              <UserEditCore :user="resolvedUser" :outcome="coreOutcome" />
            </ClientOnly>

            <FireStateCard v-else entity="profile" kind="document" loading />
          </section>

          <AppMembership />

          <UPageCard v-if="appUser" variant="subtle">
            <div>
              <div>
                <div>
                  <p>Your plan</p>
                  <UBadge color="neutral" variant="soft">
                    {{ appUser.subscription }}
                  </UBadge>
                </div>
                <p>Compare Free, Pro and Business.</p>
              </div>
              <UButton
                label="View plans"
                to="/pricing"
                trailing-icon="i-lucide-arrow-right"
              />
            </div>
          </UPageCard>

          <section aria-label="Account details">
            <FireStateCard
              v-if="accountOutcome === 'idle' || accountOutcome === 'pending'"
              entity="private account"
              kind="document"
              loading
            />

            <FireStateCard
              v-else-if="accountOutcome === 'error'"
              entity="private account"
              kind="document"
              state="error"
              title="Private details unavailable"
              description="Your profile still works, but private account details could not be loaded."
            />

            <FireStateCard
              v-else-if="accountOutcome === 'empty'"
              entity="private account"
              kind="document"
              state="empty"
              title="Private account record missing"
              description="Your profile still works, but the private account record needs to be restored."
            />

            <UPageCard
              v-else-if="account"
              title="Account"
              icon="i-lucide-shield-check"
              variant="subtle"
            >
              <dl class="fx-card__detail-grid">
                <div>
                  <dt>Email</dt>
                  <dd>
                    {{ account.email || 'Not available' }}
                  </dd>
                </div>
                <div>
                  <dt>Terms accepted</dt>
                  <dd>
                    {{ termsAcceptedLabel || 'Not recorded' }}
                  </dd>
                </div>
                <div>
                  <dt>Terms version</dt>
                  <dd>
                    {{ account.terms.version || 'Not recorded' }}
                  </dd>
                </div>
              </dl>

              <template #footer>
                <div>
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

            <FireStateCard
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
import { useUserSession } from '../../user/composables/session/useUserSession'
import { useUserAccount } from '../../user/composables/account/useUserAccount'
import { useUserView } from '../../user/composables/useUserView'
import { formatFirestoreTimestamp } from '../../utils/firestore-timestamp'

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

const { subscription, coreError, coreOutcome, coreUser, appUser } =
  useUserSession()
const { outcome: accountOutcome, account } = useUserAccount()
const { profile: userInterface } = useUserView()

const isLoading = computed(
  () => coreOutcome.value === 'idle' || coreOutcome.value === 'pending'
)
const userError = computed(
  () => coreOutcome.value === 'error' || Boolean(coreError.value)
)
const isEmpty = computed(() => coreOutcome.value === 'empty')
const resolvedUser = computed(() => coreUser.value ?? null)
const userCard = computed(() => userInterface(resolvedUser.value))
const termsAcceptedLabel = computed(() =>
  formatFirestoreTimestamp(account.value?.terms.accepted_at, {
    fallback: '',
    locale: 'en-GB',
  })
)
</script>
