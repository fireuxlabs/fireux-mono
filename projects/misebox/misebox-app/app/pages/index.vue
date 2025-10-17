<template>
  <div>
    <UContainer>
      <UPageSection class="py-16 lg:py-24">
        <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
          <LandingHero />
          <LandingQuickPeek />
        </div>
      </UPageSection>
    </UContainer>

    <LandingSolutions
      :title="solutions.title"
      :subtitle="solutions.subtitle"
      :items="solutions.items"
    />
  </div>
</template>

<script setup>
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

useSeoMeta({
  title: 'Misebox — Digital Mise en Place',
  description:
    'Recipes, inventory, suppliers, and kitchen workflows in one connected platform.',
})

const solutions = {
  title: 'Solutions',
  subtitle: 'Digitize mise en place with connected kitchen operations.',
  items: [
    {
      title: 'Recipes',
      description: 'Cards, yields, and scaling math with version history.',
      to: '/recipes',
      cta: 'Open recipes',
      icon: 'i-lucide-book-open',
    },
    {
      title: 'Inventory',
      description: 'Stock counts, batch tracking, and wastage control.',
      to: '/inventory',
      cta: 'Count stock',
      icon: 'i-lucide-package',
    },
    {
      title: 'Suppliers',
      description: 'Price lists, reorder points, and delivery scheduling.',
      to: '/suppliers',
      cta: 'Link vendors',
      icon: 'i-lucide-truck',
    },
    {
      title: 'Prep plans',
      description: 'Station timelines, batch cooking, and checklists.',
      to: '/prep',
      cta: 'Schedule',
      icon: 'i-lucide-clipboard-list',
    },
    {
      title: 'Costing',
      description: 'COGS, margins, and menu engineering insights.',
      to: '/costing',
      cta: 'Price menu',
      icon: 'i-lucide-calculator',
    },
    {
      title: 'Insights',
      description: 'POS ties, trends, and forecast dashboards.',
      to: '/insights',
      cta: 'View KPIs',
      icon: 'i-lucide-chart-line',
    },
  ],
}
</script>
