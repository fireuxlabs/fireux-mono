<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Set Up Your Account"
      description="Sign in, restore a missing user record, or re-ensure your active app membership safely."
    />

    <UPageBody class="pagebody">
      <UserCreateSystem />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import UserCreateSystem from '../../components/organisms/User/Create/System.vue'

definePageMeta({
  layout: 'default',
  title: 'Set Up Your Account',
  description: 'Create or repair the active user record and app membership safely.',
  nav: {
    key: 'users-create',
    label: 'Create user',
    icon: 'i-lucide-user-plus',
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  name: 'UsersCreatePage',
})

useHead({ title: 'Set Up Your Account' })
</script>
