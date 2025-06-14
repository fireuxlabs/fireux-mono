<template>
  <div class="auth-page">
    <UContainer class="auth-container">
      <div class="auth-content">
        <!-- App Logo and Branding -->
        <div class="auth-header">
          <h1 class="auth-title">Welcome to {{ appName }}</h1>
        </div>

        <!-- Auth System Component -->
        <div class="auth-system">
          <FireOrganismsAuthSystem />
        </div>

        <!-- App Info Section -->
        <div class="auth-footer">
          <p class="auth-info">
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

// Redirect logged-in users to the dashboard
if (currentUser?.uid && !currentUser.isAnonymous) {
  router.push('/dashboard')
}

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
