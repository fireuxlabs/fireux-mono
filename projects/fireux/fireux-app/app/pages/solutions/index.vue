<!-- Concurrent edit — 2026-07-21 12:28 CEST — FireUX solutions hub: curate FireUX offers before exposing ecosystem catalogues. -->
<!-- Concurrent edit — 2026-07-21 12:57 CEST — FireUX project positioning: surface the current Project Workspace as a restrained solution. -->
<template>
  <UPage>
    <UContainer>
      <div class="pagebody">
        <header class="pagebody">
          <ULink to="/"> FireUX </ULink>
          <h1 class="fx-type-page-title">FireUX solutions</h1>
          <p class="fx-type-body">
            Search-led pages for specific jobs a FireUX App or Ecosystem can
            support.
          </p>
        </header>

        <section class="pagebody">
          <div class="pagebody">
            <h2 class="fx-type-section-title">Start here</h2>
            <p class="fx-type-caption">
              Choose the job closest to the App you need.
            </p>
          </div>
          <UPageGrid>
            <UPageCard
              v-for="solution in featuredSolutions"
              :key="solution.slug"
              :title="solution.title"
              :description="solution.description"
              :icon="solution.icon || 'i-lucide-lightbulb'"
              :to="solution.to || `/solutions/${solution.slug}`"
              :target="solution.external ? '_blank' : undefined"
              variant="subtle"
            />
          </UPageGrid>
        </section>

        <section class="pagebody">
          <h2 class="fx-type-section-title">More solutions</h2>
          <UCard variant="subtle">
            <div>
              <ULink
                v-for="solution in moreSolutions"
                :key="solution.slug"
                :to="solution.to || `/solutions/${solution.slug}`"
                :target="solution.external ? '_blank' : undefined"
              >
                <UIcon :name="solution.icon || 'i-lucide-lightbulb'" />
                <span>
                  <span>
                    {{ solution.title }}
                  </span>
                  <span>
                    {{ solution.description }}
                  </span>
                </span>
                <UIcon name="i-lucide-arrow-right" />
              </ULink>
            </div>
          </UCard>
        </section>

        <section v-if="platformSolutions.length" class="pagebody">
          <div class="pagebody">
            <h2 class="fx-type-section-title">FireUX App options</h2>
            <p class="fx-type-caption">
              Use Ignition to request a FireUX App, or explore published
              Ecosystems and their Apps.
            </p>
          </div>
          <div>
            <ULink
              v-for="solution in platformSolutions"
              :key="solution.slug"
              :to="`/solutions/${solution.slug}`"
            >
              {{ solution.title }}
            </ULink>
          </div>
        </section>
      </div>
    </UContainer>
  </UPage>
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
  $fetch<SolutionsResponse>('/api/app/solutions')
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
