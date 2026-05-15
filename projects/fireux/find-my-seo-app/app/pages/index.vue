<template>
  <UPage>
    <LandingMissingBrandAssetsFlag />

    <UPageHeader
      class="pageheader"
      title="Connect your project with SEO professionals."
      description="Search-led profiles help you compare specialists by service, sector and proof."
    >
      <template #headline>
        <UBadge color="primary" variant="soft">
          SEO Professional Pool
        </UBadge>
      </template>

      <template #links>
        <UButton to="/professionals" color="primary" icon="i-lucide-search">
          Find an SEO specialist
        </UButton>
        <UButton to="/dashboard/professional" variant="soft" icon="i-lucide-user-plus">
          Create a provider profile
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody space-y-10">
      <section class="space-y-4" aria-labelledby="featured-title">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-sm font-semibold text-primary">Featured SEO specialists</p>
            <h2 id="featured-title" class="text-2xl font-semibold">
              Profiles built to be found.
            </h2>
          </div>
          <UButton to="/professionals" variant="soft" icon="i-lucide-arrow-right">
            Browse all
          </UButton>
        </div>

        <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <FindmyseoProviderCard
            v-for="provider in featured"
            :key="provider.id"
            :provider="provider"
          />
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]" aria-labelledby="specialisms-title">
        <UPageCard
          id="specialisms-title"
          title="Search doorways"
          description="Each specialism becomes a page buyers can find."
          variant="subtle"
        >
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="specialism in highlightedSpecialisms"
              :key="specialism"
              color="neutral"
              variant="soft"
            >
              {{ specialism }}
            </UBadge>
          </div>
        </UPageCard>

        <div class="grid gap-4 sm:grid-cols-3">
          <UPageCard
            v-for="stat in stats"
            :key="stat.label"
            :title="stat.value"
            :description="stat.label"
            variant="subtle"
          />
        </div>
      </section>

      <section class="space-y-4" aria-labelledby="how-title">
        <h2 id="how-title" class="text-2xl font-semibold">
          How it works
        </h2>
        <div class="grid gap-4 md:grid-cols-3">
          <UPageCard
            v-for="step in steps"
            :key="step.title"
            :title="step.title"
            :description="step.copy"
            :icon="step.icon"
            variant="subtle"
          />
        </div>
      </section>

      <section class="space-y-4" aria-labelledby="trust-title">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="trust-title" class="text-2xl font-semibold">
            Proof before enquiry
          </h2>
          <UButton to="/case-studies" variant="soft" icon="i-lucide-badge-check">
            View case studies
          </UButton>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <UPageCard
            v-for="item in trustSignals"
            :key="item.title"
            :title="item.title"
            :description="item.copy"
            :icon="item.icon"
            variant="subtle"
          />
        </div>
      </section>

      <UPageCTA
        title="Find your SEO professional"
        description="Pick a specialist or open the provider dashboard."
      >
        <template #links>
          <div class="flex flex-wrap justify-center gap-3">
            <UButton to="/professionals" color="primary" icon="i-lucide-search">
              Browse professionals
            </UButton>
            <UButton to="/dashboard/professional" variant="soft" icon="i-lucide-layout-dashboard">
              Provider dashboard
            </UButton>
          </div>
        </template>
      </UPageCTA>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { demoFeaturedSeoProviderList, demoSeoProviderList, demoSeoSpecialismOptions } from '../../../../../demo/find-my-seo.demo'
import { appMeta } from '../content/meta'

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

const featured = computed(() => demoFeaturedSeoProviderList.slice(0, 6))
const highlightedSpecialisms = computed(() =>
  demoSeoSpecialismOptions
    .filter((item) =>
      [
        'Technical SEO',
        'Local SEO',
        'Content strategy',
        'eCommerce SEO',
        'International SEO',
        'Digital PR',
        'Shopify SEO',
        'WordPress SEO',
      ].includes(item)
    )
    .slice(0, 10)
)

const averageRating = computed(() => {
  const total = demoSeoProviderList.reduce((sum, provider) => sum + provider.rating, 0)
  return (total / Math.max(demoSeoProviderList.length, 1)).toFixed(1)
})

const stats = computed(() => [
  { label: 'Example providers', value: String(demoSeoProviderList.length) },
  { label: 'Avg. rating', value: averageRating.value },
  { label: 'Canonical route', value: '/professionals' },
])

const steps = [
  {
    title: 'Capture demand',
    copy: 'Build pages around buyer searches.',
    icon: 'i-lucide-search',
  },
  {
    title: 'Show proof',
    copy: 'Group services, reviews and case studies.',
    icon: 'i-lucide-badge-check',
  },
  {
    title: 'Send leads',
    copy: 'Turn profile visits into enquiries.',
    icon: 'i-lucide-mail-plus',
  },
]

const trustSignals = [
  {
    title: 'Search-ready profiles',
    copy: 'Services, sectors and proof are structured.',
    icon: 'i-lucide-shield-check',
  },
  {
    title: 'Case studies',
    copy: 'Show problem, action and result.',
    icon: 'i-lucide-chart-no-axes-combined',
  },
  {
    title: 'Provider dashboard',
    copy: 'Manage profile, proof and leads.',
    icon: 'i-lucide-layout-dashboard',
  },
]

useSeoMeta({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
})
</script>
