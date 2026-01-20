<script setup lang="ts">
import { definePageMeta, useState } from '#imports'
import { useToastify } from '../../composables/fireux/app/ui/useToastify'
import { useColorMode } from '../../composables/fireux/app/useColorMode'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-settings',
    label: 'Settings',
    icon: 'i-lucide-settings',
    order: 1000,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

const toast = useToastify()
const colorMode = useColorMode()

// Preferences (client-only persistence later)
const preferences = useState('fireux-core:dashboard-settings:preferences', () => ({
  language: 'en',
  theme: (colorMode.value || 'system') as 'system' | 'light' | 'dark',
  emailSecurityAlerts: true,
  shareUsageAnalytics: true,
}))

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
  colorMode.value = preferences.value.theme

  toast.success('Preferences updated.')
}
</script>

<template>
  <UDashboardPanel id="dashboard-settings">
    <template #header>
      <LayoutsDashboardNavbar title="Settings" />
    </template>

    <template #body>
      <UPage>
        <UPageBody>
          <UPageHeader
            description="Private account controls. Edit public identity in Profile."
          />

          <UPageCard
            title="Preferences"
            description="Language, theme, and basic communication settings."
            variant="subtle"
            class="mb-4"
          >
            <div class="flex flex-col gap-4">
              <UFormField name="language" label="Language">
                <USelect
                  v-model="preferences.language"
                  :options="languageOptions"
                />
              </UFormField>

              <UFormField name="theme" label="Theme">
                <USelect v-model="preferences.theme" :options="themeOptions" />
              </UFormField>

              <USeparator />

              <UFormField
                name="emailSecurityAlerts"
                label="Security alerts"
                description="Important account and security notifications."
                class="flex items-center justify-between gap-4"
              >
                <USwitch v-model="preferences.emailSecurityAlerts" />
              </UFormField>

              <UFormField
                name="shareUsageAnalytics"
                label="Share usage analytics"
                description="Help improve FireUX with anonymous usage data."
                class="flex items-center justify-between gap-4"
              >
                <USwitch v-model="preferences.shareUsageAnalytics" />
              </UFormField>

              <div class="flex justify-end">
                <UButton
                  label="Save preferences"
                  color="neutral"
                  class="w-fit"
                  @click="savePreferences"
                />
              </div>
            </div>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>
