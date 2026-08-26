<!-- Concurrent edit — 2026-07-23 12:13 CEST — FireUX landing makeover: adopt the shared product-led landing family. -->
<template>
  <div class="min-h-full">
    <EffectsAmbient class="min-h-full">
      <template #effect>
        <EffectsStars />
      </template>

      <ClientOnly>
        <div
          v-if="isAuthenticated"
          class="mx-auto flex max-w-7xl justify-end px-4 pt-4 sm:px-6 lg:px-8"
        >
          <UBadge color="neutral" variant="soft" size="lg">
            Current subscription: {{ subscription }}
          </UBadge>
        </div>
      </ClientOnly>

      <FireUXLandingIndex />
    </EffectsAmbient>
  </div>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { appMeta } from '../meta'
import FireUXLandingIndex from '../components/FireUX/Landing/Index.vue'

const { isAuthenticated } = useAuth()
const { subscription } = useUser()

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useAppLandingSeo({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
  path: '/',
  image: '/img/app/cover.png',
  logo: '/img/app/logo.png',
})
</script>
