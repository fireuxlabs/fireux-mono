<template>
  <!-- Background effect (Misebox) -->
  <EffectsSteam />

  <div>
    <LandingShell>
      <template #left>
        <LandingHero />
      </template>
      <template #right>
        <LandingQuickPeek />
      </template>
    </LandingShell>

    <section class="debug-assets">
      <article
        v-for="group in debugGroups"
        :key="group.title"
        class="debug-card"
      >
        <h3 class="debug-heading">{{ group.title }}</h3>
        <p class="debug-copy">{{ group.description }}</p>
        <ul>
          <li v-for="item in group.items" :key="item.label">
            <div class="debug-row">
              <div class="debug-preview">
                <div class="debug-tile debug-tile--light">
                  <img :src="item.path" :alt="item.label" />
                </div>
                <div class="debug-tile debug-tile--dark">
                  <img :src="item.path" :alt="item.label" />
                </div>
              </div>
              <div class="debug-text">
                <code>{{ item.label }}</code>
                <span class="debug-path">{{ item.path }}</span>
              </div>
            </div>
          </li>
        </ul>
      </article>
    </section>

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

const coreStackDebug = [
  { label: 'Stack · Nuxt (light)', path: '/img/stack/nuxt-black.png' },
  { label: 'Stack · Nuxt (dark)', path: '/img/stack/nuxt-white.png' },
  { label: 'Stack · Firebase (light)', path: '/img/stack/firebase-black.png' },
  { label: 'Stack · Firebase (dark)', path: '/img/stack/firebase-white.png' },
  { label: 'Stack · Stripe (light)', path: '/img/stack/stripe-black.png' },
  { label: 'Stack · Stripe (dark)', path: '/img/stack/stripe-white.png' },
  { label: 'Runtime · Logo Type (light)', path: '/logo-type-light.png' },
]

const brandDebug = [
  { label: 'Brand · Avatar', path: '/img/brand/avatar.png' },
  { label: 'Brand · Logo', path: '/img/brand/logo.png' },
  { label: 'Brand · Logo (svg)', path: '/img/brand/logo.svg' },
  { label: 'Brand · Wordmark (dark)', path: '/img/brand/wordmark-dark.svg' },
  { label: 'Brand · Wordmark (light)', path: '/img/brand/wordmark-light.svg' },
  { label: 'Brand · Wordmark', path: '/img/brand/wordmark.png' },
]

const debugGroups = [
  {
    title: 'Core Runtime — fireux-core',
    description:
      'packages/core/fireux-core/src/runtime/public/img/stack (served via /img/stack/*)',
    items: coreStackDebug,
  },
  {
    title: 'Misebox App — public/img/brand',
    description:
      'projects/misebox/misebox-app/public/img/brand (tenant-specific branding)',
    items: brandDebug,
  },
]

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

<style scoped>
.debug-assets {
  margin: 2rem auto;
  display: grid;
  gap: 1.5rem;
  max-width: 720px;
}

.debug-card {
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  background: var(--ui-bg-soft, rgba(148, 163, 184, 0.1));
  border: 1px dashed rgba(148, 163, 184, 0.5);
}

.debug-heading {
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.debug-copy {
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  color: rgba(100, 116, 139, 0.85);
}

.debug-card ul {
  display: grid;
  gap: 0.5rem;
  font-size: 0.85rem;
  word-break: break-all;
}

.debug-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.debug-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.debug-preview {
  display: flex;
  gap: 0.4rem;
}

.debug-tile {
  width: 56px;
  height: 56px;
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  border: 1px solid rgba(148, 163, 184, 0.35);
}

.debug-tile img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.debug-tile--light {
  background: white;
}

.debug-tile--dark {
  background: #0f172a;
}

.debug-tile--dark img {
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.6));
}

.debug-path {
  font-family: ui-monospace, SFMono-Regular, SFMono, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  font-size: 0.75rem;
}
</style>
