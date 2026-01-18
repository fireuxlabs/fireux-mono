<template>
  <UPage>
    <UPageHeader
      title="Dev · Users"
      description="Model shape for Users collection."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Users · Model'"
          :model="userModelRuntime"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';
import { User as UserModelRuntime } from '../../models/core/user.model';

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-users',
    label: 'Users',
    icon: 'i-lucide-users',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 30,
  },
  title: 'Dev · Users',
  description: 'Developer view for Users (collection-first).',
})

const userModelRuntime = UserModelRuntime as unknown as Record<string, unknown>
</script>
