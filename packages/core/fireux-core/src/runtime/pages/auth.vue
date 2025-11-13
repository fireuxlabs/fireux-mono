<template>
  <div class="page">
    <UContainer class="layout">
      <header class="heading">
        <h1 class="title">Welcome to {{ appName }}</h1>
      </header>

      <OrganismsAuthSystem />

      <p class="footnote">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
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

definePageMeta({
  layout: 'default',
  title: 'Authentication',
  icon: 'i-lucide-lock',
})
</script>

<style scoped>
.layout {
  max-width: 480px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  display: grid;
  gap: 2.5rem;
}

.heading {
  text-align: center;
}

.title {
  font-size: 1.75rem;
  font-weight: 600;
}

.footnote {
  text-align: center;
  font-size: 0.875rem;
  color: var(--ui-text-muted, #6b7280);
}
</style>
