<template>
  <div class="page">
    <UContainer class="max-w-md mx-auto py-12">
      <div class="space-y-8">
        <!-- App Logo and Branding -->
        <div class="text-center">
          <h1 class="text-2xl font-bold">Welcome to {{ appName }}</h1>
        </div>

        <!-- Auth System Component -->
        <FireOrganismsAuthSystem />

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

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/firebase/useAuth'
import { useHead } from '#app'
import { useFireUXConfig } from '../composables/FireUXConfig'

const { appName } = useFireUXConfig()
const router = useRouter()
const { currentUser } = useAuth()

// Only redirect logged-in users to dashboard if app is initialized
// For uninitialized apps, let the main app.vue handle the onboarding modal
// if (currentUser?.uid && !currentUser.isAnonymous) {
//   router.push('/dashboard')
// }

// Set page metadata
useHead({
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
