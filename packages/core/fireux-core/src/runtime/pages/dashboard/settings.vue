<!-- Concurrent edit — 2026-07-19 16:58 CEST — User/Profile pass: use the single User update seam. -->
<!-- Concurrent edit — 2026-07-21 16:58 CEST — Dashboard Family pass: present real private-account state and the one implemented appearance preference. -->
<!-- Concurrent edit — 2026-07-21 20:36 CEST — Settings Dashboard cleanup: remove preferences UI, retain account/session basics, and link back to Profile. -->
<template>
  <UDashboardPanel id="account-settings">
    <template #header>
      <LayoutsDashboardNavbar title="Settings" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            headline="Your account"
            title="Settings"
            description="Review your private account details and manage your current session."
          >
            <template #links>
              <UButton
                to="/dashboard/user-profile"
                label="Profile"
                icon="i-lucide-user-round"
                color="neutral"
                variant="soft"
              />
            </template>
          </UPageHeader>

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
            title="Account unavailable"
            description="Your public profile still works, but private account details could not be loaded."
          />

          <MoleculesStateCard
            v-else-if="privateOutcome === 'missing'"
            entity="private account"
            kind="document"
            state="missing"
            title="Private account record missing"
            description="The private account record must be restored before account details can be shown."
          />

          <div
            v-else-if="privateUser"
            class="max-w-2xl"
          >
            <UPageCard
              title="Account"
              description="Sign-in and signup-agreement details."
              icon="i-lucide-lock-keyhole"
              variant="subtle"
            >
              <dl class="divide-y divide-default text-sm">
                <div class="py-3 first:pt-0">
                  <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
                    Email
                  </dt>
                  <dd class="mt-1 break-words font-medium text-highlighted">
                    {{ accountEmail || 'Not available' }}
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

              <div
                class="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4"
              >
                <div>
                  <p class="font-medium text-highlighted">Current session</p>
                  <p class="mt-1 text-sm text-muted">
                    Signed in as {{ accountEmail || 'your account' }}.
                  </p>
                </div>

                <UButton
                  label="Sign out"
                  icon="i-lucide-log-out"
                  color="neutral"
                  variant="soft"
                  :loading="signOutLoading"
                  :disabled="signOutLoading"
                  @click="handleSignOut"
                />
              </div>
            </UPageCard>
          </div>

          <MoleculesStateCard
            v-else
            entity="private account"
            kind="document"
            loading
          />
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta, ref, useHead } from '#imports'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useUser } from '../../user/composables/useUser'
import { formatFirestoreTimestamp } from '../../utils/formatTimestamp'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-settings',
    label: 'Settings',
    icon: 'i-lucide-settings',
    position: 'bottom',
    order: 1000,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

const { currentUser: authUser, signOutUser } = useAuth()
const { privateOutcome, privateUser } = useUser()
const signOutLoading = ref(false)

const accountEmail = computed(
  () => privateUser.value?.email || authUser.value?.email || ''
)
const termsAcceptedLabel = computed(() =>
  formatFirestoreTimestamp(privateUser.value?.terms.accepted_at, {
    fallback: '',
    locale: 'en-GB',
  })
)

const handleSignOut = async () => {
  if (signOutLoading.value) return
  signOutLoading.value = true
  try {
    await signOutUser('/')
  } finally {
    signOutLoading.value = false
  }
}

useHead({ title: 'Settings' })
</script>
