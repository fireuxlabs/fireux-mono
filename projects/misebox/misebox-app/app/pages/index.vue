<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="misebox-kitchen-home">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen AI">
          <template #right>
            <UButton
              v-if="!isAuthenticated"
              to="/auth?mode=sign-up&redirect=%2F"
              label="Save my Kitchen"
              color="neutral"
              variant="soft"
            />
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="console-surface">
          <ConsoleKitchenTools />
          <ConsoleKitchenAI />
          <ConsoleKitchen v-if="isAuthenticated" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '../meta'

const { isAuthenticated } = useAuth()

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  consoleAccess: 'public-entry',
  nav: {
    key: 'home',
    label: 'Kitchen AI',
    icon: 'i-lucide-sparkles',
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: false,
  requiresSelection: false,
})

useAppLandingSeo({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
  path: '/',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
