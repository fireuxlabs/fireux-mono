<template>
  <div class="page">
    <UContainer class="max-w-md mx-auto py-12">
      <div class="space-y-10">
        <!-- App Logo and Branding -->
        <div class="text-center">
          <h1 class="text-2xl font-bold">Welcome to {{ appName }}</h1>
        </div>

        <!-- Auth System Component -->
        <OrganismsAuthSystem />

        <!-- App Info Section -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../composables/FireUXConfig'

const { appName } = useFireUXConfig()

const useHeadFn = (globalThis as any).useHead as
  | undefined
  | ((payload: {
      title: string
      meta: Array<{ name: string; content: string }>
    }) => void)

useHeadFn?.({
  title: `Sign In - ${appName}`,
  meta: [
    {
      name: 'description',
      content: `Sign in to your ${appName} account to access all features and manage your profile.`,
    },
  ],
})

// Define page metadata for Nuxt
definePageMeta({
  layout: 'default',
  title: 'Authentication',
  icon: 'i-lucide-lock',
})
</script>
