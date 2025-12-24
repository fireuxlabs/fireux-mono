<script setup lang="ts">
import { definePageMeta, useColorMode, useState, useToast } from '#imports'

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

const toast = useToast()
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

  toast.add({
    title: 'Saved',
    description: 'Preferences updated (persistence coming soon).',
    icon: 'i-lucide-check',
    color: 'success',
  })
}

// Authentication (stub)
const password = useState('fireux-core:dashboard-settings:password', () => ({
  current: '',
  new: '',
}))

const submitPassword = async () => {
  if (!password.value.current || !password.value.new) {
    toast.add({
      title: 'Missing fields',
      description: 'Enter your current password and a new password.',
      icon: 'i-lucide-info',
      color: 'warning',
    })
    return
  }

  if (password.value.current === password.value.new) {
    toast.add({
      title: 'Invalid password',
      description: 'New password must be different from current password.',
      icon: 'i-lucide-info',
      color: 'warning',
    })
    return
  }

  toast.add({
    title: 'Not implemented',
    description: 'Password updates are not wired yet.',
    icon: 'i-lucide-info',
    color: 'warning',
  })
}

// Notifications (stub)
const notificationState = useState<Record<string, boolean>>(
  'fireux-core:dashboard-settings:notifications',
  () => ({
  email: true,
  desktop: false,
  important_updates: true,
  })
)

const notificationSections = [
  {
    title: 'Notification channels',
    description: 'Where can we notify you?',
    fields: [
      {
        name: 'email',
        label: 'Email',
        description: 'Receive email notifications.',
      },
      {
        name: 'desktop',
        label: 'Desktop',
        description: 'Receive desktop notifications.',
      },
    ],
  },
  {
    title: 'Important updates',
    description: 'Security fixes, maintenance, and other critical updates.',
    fields: [
      {
        name: 'important_updates',
        label: 'Important updates',
        description: 'Recommended to keep enabled.',
      },
    ],
  },
]

const onNotificationChange = () => {
  toast.add({
    title: 'Saved',
    description: 'Notification preferences updated.',
    icon: 'i-lucide-check',
    color: 'success',
  })
}
</script>

<template>
  <UDashboardPanel id="dashboard-settings">
    <template #header>
      <UDashboardNavbar title="Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
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

          <UPageCard
            title="Authentication"
            description="Update your password (stub)."
            variant="subtle"
            class="mb-4"
          >
            <UForm
              :state="password"
              @submit="submitPassword"
              class="flex flex-col gap-4 max-w-xs"
            >
              <UFormField name="current">
                <UInput
                  v-model="password.current"
                  type="password"
                  placeholder="Current password"
                  class="w-full"
                />
              </UFormField>

              <UFormField name="new">
                <UInput
                  v-model="password.new"
                  type="password"
                  placeholder="New password"
                  class="w-full"
                />
              </UFormField>

              <UButton label="Update password" class="w-fit" type="submit" />
            </UForm>
          </UPageCard>

          <UPageCard
            title="Notifications"
            description="Manage notification preferences (stub)."
            variant="subtle"
          >
            <div class="flex flex-col gap-4">
              <div v-for="(section, index) in notificationSections" :key="index">
                <UPageCard
                  :title="section.title"
                  :description="section.description"
                  variant="naked"
                  class="mb-2"
                />

                <UPageCard
                  variant="subtle"
                  :ui="{ container: 'divide-y divide-default' }"
                  class="mb-4"
                >
                  <UFormField
                    v-for="field in section.fields"
                    :key="field.name"
                    :name="field.name"
                    :label="field.label"
                    :description="field.description"
                    class="flex items-center justify-between not-last:pb-4 gap-2"
                  >
                    <USwitch
                      v-model="notificationState[field.name]"
                      @update:model-value="onNotificationChange"
                    />
                  </UFormField>
                </UPageCard>
              </div>
            </div>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>
