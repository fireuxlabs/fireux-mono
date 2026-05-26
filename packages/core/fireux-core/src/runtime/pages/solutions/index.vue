<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-10 sm:py-14">
      <div class="mx-auto max-w-5xl space-y-8">
        <header class="max-w-3xl space-y-3">
          <UBadge color="primary" variant="soft">Solutions</UBadge>
          <h1 class="text-3xl font-semibold tracking-normal text-highlighted sm:text-4xl">
            {{ appName }} solutions
          </h1>
          <p class="text-base leading-7 text-muted">
            Practical entry points for the jobs this app helps with.
          </p>
        </header>

        <PublicSolutionsGrid
          v-if="solutions.length"
          :solutions="solutions"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No solutions published yet"
          description="This app has not declared public solution pages."
        />
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, useSeoMeta } from '#imports'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import type { FireuxMetaSolution } from '../../models/system/meta-content.model'

type SolutionsResponse = {
  ok: boolean
  solutions: FireuxMetaSolution[]
}

const fireux = useFireUXConfig()
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')

const { data } = await useAsyncData('public-app-solutions', () =>
  $fetch<SolutionsResponse>('/api/public/app/solutions')
)

const solutions = computed(() => data.value?.solutions || [])

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
