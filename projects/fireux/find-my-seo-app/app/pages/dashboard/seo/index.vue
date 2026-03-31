<template>
  <UDashboardPanel>
    <template #header>
      <LayoutsConsoleNavbar title="SEO dashboard" />
    </template>

    <template #body>
      <section class="grid gap-4 md:grid-cols-3">
        <UCard v-for="item in items" :key="item.title">
          <div class="space-y-3">
            <p class="text-lg font-semibold">{{ item.title }}</p>
            <p class="text-sm leading-6 text-toned">{{ item.copy }}</p>
            <UButton :to="item.to" variant="soft">{{ item.cta }}</UButton>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
})

const items = [
  {
    title: 'Providers',
    copy: 'Review consultants and agencies in one editorial list and open each listing for updates.',
    to: '/dashboard/seo/providers',
    cta: 'Open providers',
  },
  {
    title: 'Case studies',
    copy: 'Maintain structured proof so buyers can compare outcomes with confidence.',
    to: '/dashboard/seo/case-studies',
    cta: 'Manage case studies',
  },
  {
    title: 'Leads',
    copy: 'Review the first lightweight enquiry inbox without needing a deep console stack.',
    to: '/dashboard/seo/leads',
    cta: 'Open leads',
  },
]
</script>
