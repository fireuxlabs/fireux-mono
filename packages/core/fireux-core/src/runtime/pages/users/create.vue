<template>
  <UPage>
    <UPageBody class="pagebody">
      <UserCreateSystem />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import UserCreateSystem from '../../user/components/Create/System.vue'

definePageMeta({
  layout: 'auth',
  requiresAuth: true,
  title: 'Create Your User',
  description: 'Set up your FireUX identity and account.',
  nav: {
    key: 'users-create',
    label: 'Create user',
    icon: 'i-lucide-user-plus',
    desktop: false,
    mobile: false,
  },
  name: 'UsersCreatePage',
})

useHead({ title: 'Create Your User' })
</script>
