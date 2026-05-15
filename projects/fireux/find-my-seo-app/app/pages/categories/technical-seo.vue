<template>
  <UPage>
    <UPageHeader
      title="Technical SEO professionals"
      description="Curated example providers for audits, migrations, Core Web Vitals, crawlability, and technical governance."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-2">
            <p class="text-sm uppercase tracking-[0.18em] text-dimmed">Category</p>
            <h2 class="text-2xl font-semibold">Find technical SEO help without guessing</h2>
            <p class="max-w-3xl text-sm leading-6 text-toned">
              These example providers show how Find My SEO can group specialists by the work buyers actually need:
              migrations, audits, performance, indexing, and implementation support.
            </p>
          </div>
          <UButton to="/professionals" color="primary" icon="i-lucide-search">
            Browse all professionals
          </UButton>
        </div>
      </UCard>

      <div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <FindmyseoProviderCard
          v-for="provider in technicalProviders"
          :key="provider.id"
          :provider="provider"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { demoSeoProviderList } from '../../../../../../demo/find-my-seo.demo'

const technicalProviders = computed(() =>
  demoSeoProviderList.filter((provider) =>
    provider.specialisms.some((item) =>
      ['Technical SEO', 'Site migrations', 'Core Web Vitals', 'Shopify SEO', 'WordPress SEO'].includes(item)
    )
  )
)

useSeoMeta({
  title: 'Technical SEO professionals | Find My SEO',
  description: 'Browse curated technical SEO consultants and agencies by proof, specialism, and availability.',
})
</script>
