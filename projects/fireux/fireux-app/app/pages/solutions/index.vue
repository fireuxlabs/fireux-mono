<!-- Concurrent edit — 2026-07-21 12:28 CEST — FireUX solutions hub: curate FireUX offers before exposing ecosystem catalogues. -->
<!-- Concurrent edit — 2026-07-21 12:57 CEST — FireUX project positioning: surface the current Project Console as a restrained solution. -->
<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-10 sm:py-14">
      <div class="mx-auto grid max-w-5xl gap-10">
        <header class="grid max-w-3xl gap-3">
          <NuxtLink
            to="/"
            class="w-fit text-sm font-semibold text-primary hover:underline"
          >
            FireUX
          </NuxtLink>
          <h1
            class="m-0 text-3xl font-semibold leading-tight text-highlighted sm:text-4xl"
          >
            FireUX solutions
          </h1>
          <p class="m-0 text-base leading-7 text-muted">
            Search-led pages for specific jobs a FireUX App or Ecosystem can
            support.
          </p>
        </header>

        <section class="grid gap-5">
          <div class="grid gap-1">
            <h2 class="m-0 text-xl font-semibold text-highlighted">
              Start here
            </h2>
            <p class="m-0 text-sm leading-6 text-muted">
              Choose the job closest to the App you need.
            </p>
          </div>
          <PublicSolutionsGrid :solutions="featuredSolutions" />
        </section>

        <section class="grid gap-5">
          <h2 class="m-0 text-xl font-semibold text-highlighted">
            More solutions
          </h2>
          <UCard variant="subtle">
            <div class="divide-y divide-default">
              <NuxtLink
                v-for="solution in moreSolutions"
                :key="solution.slug"
                :to="solution.to || `/solutions/${solution.slug}`"
                :target="solution.external ? '_blank' : undefined"
                class="flex min-w-0 items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <UIcon
                  :name="solution.icon || 'i-lucide-lightbulb'"
                  class="size-5 shrink-0 text-primary"
                />
                <span class="min-w-0 flex-1">
                  <span class="block font-semibold text-highlighted">
                    {{ solution.title }}
                  </span>
                  <span class="block text-sm leading-6 text-muted">
                    {{ solution.description }}
                  </span>
                </span>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4 shrink-0 text-muted"
                />
              </NuxtLink>
            </div>
          </UCard>
        </section>

        <section
          v-if="platformSolutions.length"
          class="grid gap-4 border-t border-default pt-8"
        >
          <div class="grid gap-1">
            <h2 class="m-0 text-lg font-semibold text-highlighted">
              FireUX App options
            </h2>
            <p class="m-0 text-sm leading-6 text-muted">
              Use Ignition to request a FireUX App, or explore published
              Ecosystems and their Apps.
            </p>
          </div>
          <div class="flex flex-wrap gap-x-5 gap-y-3">
            <NuxtLink
              v-for="solution in platformSolutions"
              :key="solution.slug"
              :to="`/solutions/${solution.slug}`"
              class="text-sm font-semibold text-primary hover:underline"
            >
              {{ solution.title }}
            </NuxtLink>
          </div>
        </section>
      </div>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import type { FireuxMetaSolution } from 'fireux-core/config/app/meta-content'

type SolutionsResponse = {
  ok: boolean
  solutions: FireuxMetaSolution[]
}

const seoSlugs = new Set([
  'fireux-project-overview',
  'app-for-small-business',
  'customer-portal',
  'employee-portal',
  'internal-business-app',
  'business-directory-app',
  'marketplace-app',
  'branded-web-app',
])

const platformSlugs = new Set([
  'fireux-app',
  'fireux-template',
  'launch-ecosystem',
  'launch-tenant-app',
  'app-products-and-blog',
])

const { data } = await useAsyncData('public-app-solutions', () =>
  $fetch<SolutionsResponse>('/api/public/app/solutions')
)

const fireuxSolutions = computed(() =>
  (data.value?.solutions || []).filter(
    (solution: FireuxMetaSolution) =>
      solution.owner?.id === 'fireux' && seoSlugs.has(solution.slug)
  )
)
const featuredSolutions = computed(() =>
  fireuxSolutions.value.filter(
    (solution: FireuxMetaSolution) => solution.featured
  )
)
const moreSolutions = computed(() =>
  fireuxSolutions.value.filter(
    (solution: FireuxMetaSolution) => !solution.featured
  )
)
const platformSolutions = computed(() =>
  (data.value?.solutions || []).filter(
    (solution: FireuxMetaSolution) =>
      solution.owner?.id === 'fireux' && platformSlugs.has(solution.slug)
  )
)

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

useSeo({
  title: 'FireUX Solutions',
  description:
    'Find a specific job for a FireUX App, then use it to brief an Ignition request.',
  path: '/solutions',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      pageType: 'CollectionPage',
      title: context.title,
      items: [...fireuxSolutions.value, ...platformSolutions.value].map(
        (solution) => ({
          name: solution.title,
          url: context.absoluteUrl(
            solution.to || `/solutions/${solution.slug}`
          ),
        })
      ),
    }),
})
</script>
