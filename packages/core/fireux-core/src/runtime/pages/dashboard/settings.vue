<!-- Concurrent edit — 2026-07-19 16:58 CEST — User/Profile pass: use the single User update seam. -->
<!-- Concurrent edit — 2026-07-21 16:58 CEST — Dashboard Family pass: present real private-account state and the one implemented appearance preference. -->
<template>
  <UDashboardPanel id="account-settings">
    <template #header>
      <LayoutsDashboardNavbar title="Settings" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            headline="Private account"
            title="Settings"
            description="Review the account details only you can see and choose how FireUX looks for you."
          >
            <template #links>
              <UButton
                to="/dashboard/user-profile"
                label="Public profile"
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
            title="Account settings unavailable"
            description="Your public profile is unaffected, but private account details could not be read."
          />

          <MoleculesStateCard
            v-else-if="privateOutcome === 'missing'"
            entity="private account"
            kind="document"
            state="missing"
            title="Private account record missing"
            description="Settings cannot be saved until the private account record is restored. Your public profile and App access are unchanged."
          />

          <div
            v-else-if="privateUser"
            class="grid gap-4 lg:grid-cols-2"
          >
            <UPageCard
              title="Account"
              description="Private sign-in and signup-agreement details."
              icon="i-lucide-shield-check"
              variant="subtle"
            >
              <dl class="space-y-4 text-sm">
                <div>
                  <dt class="text-muted">Email</dt>
                  <dd class="mt-1 font-medium text-highlighted">
                    {{ accountEmail || 'Not available' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-muted">Terms version</dt>
                  <dd class="mt-1 font-medium text-highlighted">
                    {{ privateUser.terms.version || 'Not recorded' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-muted">Accepted</dt>
                  <dd class="mt-1 font-medium text-highlighted">
                    {{ termsAcceptedLabel || 'Not recorded' }}
                  </dd>
                </div>
              </dl>
            </UPageCard>

            <UPageCard
              title="Appearance"
              description="Choose the colour mode used when you open FireUX."
              icon="i-lucide-palette"
              variant="subtle"
            >
              <div class="space-y-5">
                <UFormField
                  name="theme"
                  label="Theme"
                  :description="themeDescription"
                >
                  <USelect
                    v-model="selectedTheme"
                    :options="themeOptions"
                    :disabled="isSaving"
                  />
                </UFormField>

                <div class="flex items-center gap-2 text-sm text-muted">
                  <UIcon
                    :name="hasThemeChanges ? 'i-lucide-circle-dot' : 'i-lucide-circle-check'"
                    class="size-4 shrink-0"
                  />
                  <span>
                    {{
                      hasThemeChanges
                        ? 'Your appearance change has not been saved.'
                        : 'Your appearance setting is up to date.'
                    }}
                  </span>
                </div>
              </div>

              <template #footer>
                <div class="flex justify-end">
                  <UButton
                    label="Save appearance"
                    color="neutral"
                    icon="i-lucide-save"
                    :loading="isSaving"
                    :disabled="!canSaveTheme"
                    @click="saveTheme"
                  />
                </div>
              </template>
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
import { computed, definePageMeta, ref, useHead, watch } from '#imports'
import { useColorMode } from '../../composables/fireux/app/useColorMode'
import { useToastify } from '../../composables/fireux/app/ui/useToastify'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import type { UserPrivate } from '../../models/core/user.model'
import { UserPrivateModel } from '../../models/core/user.model'
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

const toast = useToastify()
const colorMode = useColorMode()
const { currentUser: authUser } = useAuth()
const userApi = useUser()
const { privateOutcome, privateUser } = userApi

const selectedTheme = ref<UserPrivate['preferences']['theme']>(
  UserPrivateModel.preferences.theme
)
const savedTheme = ref<UserPrivate['preferences']['theme']>(
  UserPrivateModel.preferences.theme
)
const isSaving = ref(false)

watch(
  privateUser,
  (value) => {
    if (!value) return
    selectedTheme.value = value.preferences.theme
    savedTheme.value = value.preferences.theme
  },
  { immediate: true }
)

const accountEmail = computed(
  () => privateUser.value?.email || authUser.value?.email || ''
)
const termsAcceptedLabel = computed(() =>
  formatFirestoreTimestamp(privateUser.value?.terms.accepted_at, {
    fallback: '',
    locale: 'en-GB',
  })
)
const hasThemeChanges = computed(
  () => selectedTheme.value !== savedTheme.value
)
const canSaveTheme = computed(
  () =>
    privateOutcome.value === 'ready' &&
    Boolean(privateUser.value) &&
    hasThemeChanges.value &&
    !isSaving.value
)
const themeDescription = computed(() => {
  if (selectedTheme.value === 'system') {
    return 'Follow your device light or dark appearance.'
  }
  return selectedTheme.value === 'dark'
    ? 'Use dark appearance on this account.'
    : 'Use light appearance on this account.'
})

const themeOptions = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

const saveTheme = async () => {
  if (!canSaveTheme.value || !privateUser.value) return
  const nextTheme = selectedTheme.value
  isSaving.value = true
  try {
    await userApi.update(
      {
        preferences: {
          ...privateUser.value.preferences,
          theme: nextTheme,
        },
      },
      { private: true }
    )
    savedTheme.value = nextTheme
    colorMode.value = nextTheme
    toast.success('Appearance updated.')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Appearance was not updated: ${message}`)
  } finally {
    isSaving.value = false
  }
}

useHead({ title: 'Settings' })
</script>
