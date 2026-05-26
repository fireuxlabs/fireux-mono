<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-10 sm:py-14">
      <div class="mx-auto max-w-5xl space-y-8">
        <LandingSolutions variant="hub" />
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta } from '#imports'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'

const fireux = useFireUXConfig()
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'solutions',
    label: 'Solutions',
    icon: 'i-lucide-lightbulb',
    order: 28,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
    visibility: {
      appRoles: ['global', 'standalone'],
    },
  },
})

useSeoMeta({
  title: () => `Solutions - ${appName.value}`,
  ogTitle: () => `Solutions - ${appName.value}`,
  twitterTitle: () => `Solutions - ${appName.value}`,
  description: () => `Practical solution pages for ${appName.value}.`,
  ogDescription: () => `Practical solution pages for ${appName.value}.`,
  twitterDescription: () => `Practical solution pages for ${appName.value}.`,
})
</script>
