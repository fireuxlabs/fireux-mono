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
  layout: 'default',
  requiresAuth: true,
  title: 'Create Your User',
  description: 'Create your public FireUX identity and connect it to this App.',
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

useHead({ title: 'Create Your User' })
</script>
