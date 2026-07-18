<template>
  <section class="landing-index-section">
    <div class="space-y-6">
      <div class="space-y-2">
        <h2 class="text-3xl font-semibold">
          What the console covers.
        </h2>
        <p class="text-muted">
          Granite is built for branch-level oversight across multiple client portfolios.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard v-for="item in items" :key="item.title">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <UIcon :name="item.icon" />
              <p class="font-medium">{{ item.title }}</p>
            </div>
            <p class="text-sm text-muted">
              {{ item.description }}
            </p>
            <div>
              <UButton :to="item.to" size="sm" variant="soft" color="neutral">
                Open
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
type LandingItem = {
  title: string
  description: string
  to: string
  icon: string
}

const items = [
  {
    title: 'Portfolios',
    description: 'One client portfolio with many properties under management.',
    to: '/portfolios',
    icon: 'i-lucide-layers-2',
  },
  {
    title: 'Properties',
    description: 'Asset visibility across the entire branch book.',
    to: '/properties',
    icon: 'i-lucide-building-2',
  },
  {
    title: 'Compliance',
    description: 'Obligations, due dates, evidence, and exposure signals.',
    to: '/compliance',
    icon: 'i-lucide-shield-check',
  },
  {
    title: 'Documents',
    description: 'Certificates, leases, policies, and packs linked to assets.',
    to: '/documents',
    icon: 'i-lucide-folder',
  },
  {
    title: 'Incidents',
    description: 'Repairs, issues, and follow-ups with clear ownership.',
    to: '/incidents',
    icon: 'i-lucide-alert-triangle',
  },
  {
    title: 'Finance',
    description: 'Mortgage timelines and advisory signals at portfolio level.',
    to: '/finance',
    icon: 'i-lucide-trending-up',
  },
] satisfies LandingItem[]
</script>
