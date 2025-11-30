<script setup lang="ts">
import * as z from 'zod'
import type { FormError } from '@nuxt/ui'

definePageMeta({ layout: 'dashboard' })

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters'),
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: undefined,
  new: undefined,
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}
</script>

<template>
  <!-- Note: Consider a future 2FA section adjacent to password change if the product requires it. -->
  <UDashboardPanel id="dashboard-settings-authentication">
    <template #header>
      <UDashboardNavbar title="Authentication">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UPageCard
        title="Password"
        description="Confirm your current password before setting a new one."
        variant="subtle"
      >
        <UForm
          :schema="passwordSchema"
          :state="password"
          :validate="validate"
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

          <UButton label="Update" class="w-fit" type="submit" />
        </UForm>
      </UPageCard>
    </template>
  </UDashboardPanel>
</template>
