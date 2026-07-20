<!-- Concurrent edit — 2026-07-19 16:58 CEST — User/Profile pass: use the single User update seam. -->
<template>
  <UDashboardPanel id="account-settings">
    <template #header>
      <LayoutsDashboardNavbar title="Settings" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            title="Private account settings"
            description="Account details and preferences are private. Edit the identity people see from Public profile."
          />

          <MoleculesStateCard
            v-if="privatePending"
            entity="private account"
            kind="document"
            loading
          />

          <template v-else>
            <UAlert
              v-if="privateError"
              color="error"
              variant="subtle"
              title="Private account unavailable"
              description="The private account record could not be read. No public profile data is affected."
              icon="i-lucide-triangle-alert"
            />

            <UAlert
              v-else-if="!privateUser"
              color="warning"
              variant="subtle"
              title="Private account record missing"
              description="Preferences cannot be saved until the account record exists. Existing public identity and app membership are unchanged."
              icon="i-lucide-shield-alert"
            />

            <div class="grid gap-4 lg:grid-cols-2">
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
                      {{ privateUser?.terms.version || 'Not recorded' }}
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
                title="Preferences"
                description="Language, appearance, and account communication choices."
                icon="i-lucide-sliders-horizontal"
                variant="subtle"
              >
                <div class="flex flex-col gap-5">
                  <UFormField name="language" label="Language">
                    <USelect
                      v-model="preferences.language"
                      :options="languageOptions"
                      :disabled="!canSavePreferences"
                    />
                  </UFormField>

                  <UFormField name="theme" label="Theme">
                    <USelect
                      v-model="preferences.theme"
                      :options="themeOptions"
                      :disabled="!canSavePreferences"
                    />
                  </UFormField>

                  <USeparator />

                  <UFormField
                    name="emailSecurityAlerts"
                    label="Security alerts"
                    description="Important account and security notifications."
                    class="flex items-center justify-between gap-4"
                  >
                    <USwitch
                      v-model="preferences.email_security_alerts"
                      :disabled="!canSavePreferences"
                    />
                  </UFormField>

                  <UFormField
                    name="shareUsageAnalytics"
                    label="Share usage analytics"
                    description="Help improve FireUX with anonymous usage data."
                    class="flex items-center justify-between gap-4"
                  >
                    <USwitch
                      v-model="preferences.share_usage_analytics"
                      :disabled="!canSavePreferences"
                    />
                  </UFormField>
                </div>

                <template #footer>
                  <div class="flex justify-end">
                    <UButton
                      label="Save preferences"
                      color="neutral"
                      :loading="isSaving"
                      :disabled="!canSavePreferences"
                      @click="savePreferences"
                    />
                  </div>
                </template>
              </UPageCard>
            </div>
          </template>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, definePageMeta, reactive, ref, watch } from '#imports'
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
const { privateUser, privatePending, privateError } = userApi

const preferences = reactive<UserPrivate['preferences']>({
  ...UserPrivateModel.preferences,
})
const isSaving = ref(false)

watch(
  privateUser,
  (value) => {
    if (!value) return
    Object.assign(preferences, value.preferences)
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
const canSavePreferences = computed(
  () => Boolean(privateUser.value && !privateError.value)
)

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Deutsch', value: 'de' },
]

const themeOptions = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
]

const savePreferences = async () => {
  if (!canSavePreferences.value || isSaving.value) return
  isSaving.value = true
  try {
    await userApi.update(
      { preferences: { ...preferences } },
      { private: true }
    )
    colorMode.value = preferences.theme
    toast.success('Preferences updated.')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Preferences were not updated: ${message}`)
  } finally {
    isSaving.value = false
  }
}
</script>
