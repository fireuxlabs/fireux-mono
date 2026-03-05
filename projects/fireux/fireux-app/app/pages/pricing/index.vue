<template>
  <div class="space-y-16 pb-20">
    <section class="border-b border-gray-200/60 py-16 dark:border-gray-800/50">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">FireUX Pricing</UBadge>

        <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
          Pricing
        </h1>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 lg:grid-cols-3">
        <UCard>
          <template #header>
            <div class="space-y-2">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Users</h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Join for free or upgrade.
              </p>
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-gray-600 dark:text-gray-300">Upgrade: $10/month per user</p>
            <UButton to="/pricing/users" variant="soft" trailing-icon="i-lucide-arrow-right">
              Details
            </UButton>
          </div>
        </UCard>

        <UCard class="border-primary/30 ring-1 ring-primary/15">
          <template #header>
            <div class="space-y-2">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Apps</h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Apps are the lead product. Pick ecosystem-hosted, FireUX-hosted, or self-hosted.
              </p>
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-gray-600 dark:text-gray-300">From $400 setup + $30/month maintenance</p>
            <UButton to="/pricing/apps" color="primary" icon="i-lucide-arrow-right">
              View app pricing
            </UButton>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="space-y-2">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Ecosystems</h2>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Own your ecosystem layer when you want full platform ownership.
              </p>
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-gray-600 dark:text-gray-300">
              $1,000 setup + $50/month ecosystem maintenance
            </p>
            <UButton to="/pricing/ecosystems" variant="soft" icon="i-lucide-arrow-right">
              View ecosystem pricing
            </UButton>
          </div>
        </UCard>
      </UContainer>
    </section>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'pricing',
    label: 'Pricing',
    icon: 'i-lucide-badge-dollar-sign',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Pricing · FireUX',
  description:
    'Navigate FireUX pricing for users, apps, and ecosystems with clear setup and maintenance models.',
})
</script>
