# Navigation Report

## Active Navigation Composables

### packages/core/fireux-core/src/runtime/composables/fireUX/nav/defineNav.ts

```typescript
import { definePageMeta } from 'nuxt/app'
import type { NavMeta } from '../../../types/nav'

type DefineNavOptions = NavMeta & {
  requiresAuth?: boolean
  roles?: string[]
  tenant?: string
}

function normaliseLayouts(value: NavMeta['layouts']): string[] | undefined {
  if (!value || value.length === 0) return undefined
  return value
}

export function defineNav(meta: DefineNavOptions) {
  const { requiresAuth, roles, tenant, ...navMeta } = meta
  const layouts = normaliseLayouts(navMeta.layouts)

  definePageMeta({
    nav: {
      group: navMeta.group ?? 'Other',
      order: navMeta.order ?? 999,
      desktop: navMeta.desktop ?? false,
      mobile: navMeta.mobile ?? false,
      ...navMeta,
      ...(layouts ? { layouts } : {}),
    },
    requiresAuth: requiresAuth ?? false,
    roles: roles ?? [],
    tenant,
  })
}
```

### packages/core/fireux-core/src/runtime/composables/fireUX/nav/useNav.ts

```typescript
import { computed } from 'vue'
import { useRouter, type RouteRecordNormalized } from 'vue-router'
import type { NavItem, NavMeta } from '../../../types/nav'

const DEFAULT_LAYOUT = 'default'
const DEFAULT_ORDER = 999

type TargetLayouts = string | string[]

type RouteMetaLike = {
  nav?: NavMeta
  requiresAuth?: boolean
  roles?: unknown
  tenant?: unknown
  title?: unknown
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function isNavMeta(value: unknown): value is NavMeta {
  return typeof value === 'object' && value !== null
}

function normaliseOrder(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) return parsed
  }
  return DEFAULT_ORDER
}

function resolveLayouts(nav: NavMeta): string[] {
  const declared = toArray(nav.layouts)
  if (declared.length === 0) return [DEFAULT_LAYOUT]
  return declared
}

function resolvePath(route: RouteRecordNormalized): string {
  if (typeof route.path === 'string' && route.path.length > 0) {
    return route.path
  }
  return String(route.name ?? '')
}

function resolveLabel(
  route: RouteRecordNormalized,
  nav: NavMeta,
  fallback: string
): string {
  if (typeof nav.label === 'string' && nav.label.trim().length > 0) {
    return nav.label
  }
  const metaTitle = (route.meta as RouteMetaLike)?.title
  if (typeof metaTitle === 'string' && metaTitle.trim().length > 0) {
    return metaTitle
  }
  if (typeof route.name === 'string' && route.name.trim().length > 0) {
    return route.name
  }
  return fallback
}

function normaliseRoles(value: unknown): string[] | undefined {
  if (value === undefined) return undefined
  const roles = toArray(value as string | string[] | undefined).filter(
    (role): role is string => typeof role === 'string' && role.length > 0
  )
  return roles
}

function buildNavItem(
  route: RouteRecordNormalized,
  nav: NavMeta,
  targetLayouts: string[]
): NavItem | null {
  const layouts = resolveLayouts(nav)
  if (!layouts.some((layout) => targetLayouts.includes(layout))) {
    return null
  }

  const to = resolvePath(route)
  const label = resolveLabel(route, nav, to)

  return {
    key:
      typeof nav.key === 'string' && nav.key.length > 0 ? nav.key : undefined,
    label,
    icon: typeof nav.icon === 'string' ? nav.icon : undefined,
    to,
    group: typeof nav.group === 'string' ? nav.group : undefined,
    profileId: typeof nav.profileId === 'string' ? nav.profileId : undefined,
    order: normaliseOrder(nav.order),
    desktop: nav.desktop !== false,
    mobile: nav.mobile !== false,
    layouts,
    requiresAuth: Boolean((route.meta as RouteMetaLike).requiresAuth),
    roles: normaliseRoles((route.meta as RouteMetaLike).roles),
    tenant:
      typeof (route.meta as RouteMetaLike).tenant === 'string'
        ? ((route.meta as RouteMetaLike).tenant as string)
        : undefined,
  }
}

function ensureLayouts(targetLayouts: TargetLayouts): string[] {
  const arr = toArray(targetLayouts)
  if (arr.length === 0) return [DEFAULT_LAYOUT]
  return arr
}

export function useNav(targetLayouts: TargetLayouts = [DEFAULT_LAYOUT]) {
  const router = useRouter()
  const wanted = ensureLayouts(targetLayouts)

  const items = computed<NavItem[]>(() => {
    const seen = new Set<string>()
    const result: NavItem[] = []

    for (const route of router.getRoutes()) {
      if ((route as any)?.aliasOf) continue

      const meta = route.meta as RouteMetaLike
      if (!isNavMeta(meta.nav)) continue

      const item = buildNavItem(route, meta.nav, wanted)
      if (!item) continue

      const dedupeKey = item.key ?? item.to ?? item.label
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

      result.push(item)
    }

    return result.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.label.localeCompare(b.label)
    })
  })

  const desktop = computed(() => items.value.filter((item) => item.desktop))
  const mobile = computed(() => items.value.filter((item) => item.mobile))

  return { items, desktop, mobile }
}
```

### packages/core/fireux-core/src/runtime/composables/fireUX/nav/presets.ts

```typescript
import { useNav } from './useNav'

export const useDefaultNav = () => useNav(['default'])
export const useLandingNav = () => useNav(['landing'])
export const useDashboardNav = () => useNav(['dashboard'])
export const useDevNav = () => useNav(['dev'])
```

## Removed Legacy Modules

- `packages/core/fireux-core/src/runtime/composables-old/fireUX/nav/defineNav.ts`
- `packages/core/fireux-core/src/runtime/composables-old/fireUX/nav/useNavIndex.ts`
- `packages/core/fireux-core/src/runtime/composables-old/fireUX/nav/useNavDefault.ts`
- `packages/core/fireux-core/src/runtime/composables-old/fireUX/nav/useDashboardNav.ts`
- `packages/core/fireux-core/src/runtime/composables-old/fireUX/useNav.ts`

## Tenant and Project Pages with Navigation Metadata

### projects/fireux/fireux-app/app/pages/index.vue

```vue
<template>
  <!-- Background effect (FireUX) -->
  <EffectsStars />

  <!-- Hero row -->
  <LandingShell>
    <template #left>
      <LandingHero
        :title="title"
        :accent="accent"
        :paragraph="paragraph"
        :badges="badges"
        :primary="hero.primary"
        :secondary="hero.secondary"
        :bullets="bullets"
      />
    </template>
    <template #right>
      <LandingQuickPeek :items="quickPeek" :footer-badge="footerBadge" />
    </template>
  </LandingShell>

  <!-- Core solutions grid -->
  <LandingSolutions
    :title="solutions.title"
    :subtitle="solutions.subtitle"
    :items="solutions.items"
  />

  <!-- Sections to ship now -->
  <LandingProducts :items="products" />
  <LandingFuel />
  <LandingFeatures first />
  <LandingSkillsIcons />
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
  title: 'FireUX — Vue.js Development Ecosystem',
  description:
    'Build faster with FireUX Core and deploy streamlined, data-driven applications.',
})

const title = 'Ignite With'
const accent = 'Powerful Applications'
const paragraph =
  'A low-code ecosystem for responsive, scalable, and data-driven applications built upon <span class="text-primary">Nuxt4</span> &amp; <span class="text-primary">Firebase</span>.'

const badges = [
  { src: '/img/nuxt-white.png', alt: 'Nuxt' },
  { src: '/img/firebase-white.png', alt: 'Firebase' },
]

const hero = {
  primary: { label: 'Get Started', to: '/get-started' },
  secondary: { label: 'Explore Projects', to: '/projects' },
}

const bullets = [
  {
    icon: 'i-lucide-cable',
    text: 'Nuxt 4 + Firebase orchestration out of the box',
  },
  {
    icon: 'i-lucide-layout-dashboard',
    text: 'Reusable design system &amp; shared components',
  },
  { icon: 'i-lucide-layers-2', text: 'Tenant-aware &amp; white-label runtime' },
  { icon: 'i-lucide-zap', text: 'Automations, PWA, and CI presets' },
]

const quickPeek = [
  {
    title: 'Modules',
    copy: 'Wire Nuxt + Firebase with ready composables.',
    icon: 'i-lucide-puzzle',
  },
  {
    title: 'Tenant theming',
    copy: 'White-label overrides with a single config.',
    icon: 'i-lucide-palette',
  },
  {
    title: 'CI ready',
    copy: 'PWA, CI presets and deploy pipelines.',
    icon: 'i-lucide-rocket',
  },
]

const footerBadge = 'Nuxt · Firebase · Stripe'

const solutions = {
  title: 'Solutions',
  subtitle: 'Ship faster with platform primitives built for modern Vue teams.',
  items: [
    {
      title: 'Products',
      description: 'Hosted tools ready to deploy without provisioning.',
      to: '/products',
      cta: 'Explore',
      icon: 'i-lucide-package',
    },
    {
      title: 'White-label',
      description: 'Rebrand FireUX apps with tenant-aware theming.',
      to: '/whitelabel',
      cta: 'Partner',
      icon: 'i-lucide-badge-check',
    },
    {
      title: 'SaaS',
      description: 'Managed subscriptions with billing and auth baked in.',
      to: '/saas',
      cta: 'See plans',
      icon: 'i-lucide-zap',
    },
    {
      title: 'Templates',
      description: 'Starter kits for founders and internal tooling teams.',
      to: '/templates',
      cta: 'Browse',
      icon: 'i-lucide-layers-2',
    },
    {
      title: 'API-first',
      description: 'Composable endpoints to extend existing stacks.',
      to: '/api',
      cta: 'Docs',
      icon: 'i-lucide-code-xml',
    },
    {
      title: 'Automation',
      description: 'No-code workflows, webhooks, and scheduled jobs.',
      to: '/automation',
      cta: 'Set up',
      icon: 'i-lucide-bot',
    },
  ],
}

const products = [
  {
    title: 'Cleanbox',
    description: 'Scheduling, QA, billing for crews.',
    to: '/cleanbox',
    logo: '/img/cleanbox.png',
    tag: 'Ops',
    tagColor: 'sky',
  },
  {
    title: 'Misebox',
    description: 'Recipes, inventory, suppliers.',
    to: '/misebox',
    logo: '/img/misebox.png',
    tag: 'Kitchen',
    tagColor: 'violet',
  },
  {
    title: 'FireUX',
    description: 'Nuxt + Firebase + Stripe core.',
    to: '/core',
    logo: '/img/fireux.png',
    tag: 'Core',
    tagColor: 'primary',
  },
]
</script>
```

### projects/fireux/tennant/app/pages/index.vue

```vue
<template>
  <div>
    <LandingHero />
    <LandingSolutions />
    <LandingFireUX />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})
useSeoMeta({
  title: 'Tenant App',
  description: 'Tenant landing page',
})
</script>
```

### projects/misebox/misebox-app/app/pages/index.vue

```vue
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
```

### projects/misebox/niederhorn/app/pages/index.vue

```vue
<template>
  <div class="app-dashboard">
    <section class="welcome-section">
      <div class="welcome-content">
        <h1 class="app-title">
          <span class="brand-name">Niederhorn</span>
          <span class="app-subtitle">Kitchen Management</span>
        </h1>

        <p class="app-description">
          Manage your ingredients, suppliers, and culinary operations with
          precision.
        </p>

        <div class="quick-actions">
          <UButton to="/ingredients" variant="solid" size="lg">
            <UIcon name="i-lucide-package" />
            Manage Ingredients
          </UButton>
          <UButton to="/suppliers" variant="outline" size="lg">
            <UIcon name="i-lucide-truck" />
            Manage Suppliers
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Niederhorn - Kitchen Management',
  description: 'Manage ingredients, suppliers, and culinary operations.',
})

definePageMeta({
  layout: 'default',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})
</script>

<style scoped>
.app-dashboard {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.welcome-section {
  text-align: center;
  max-width: 600px;
}

.app-title {
  margin-bottom: var(--space-6);
}

.brand-name {
  display: block;
  font-size: var(--text-5xl);
  font-weight: var(--font-weight-black);
  color: var(--color-primary-600);
  margin-bottom: var(--space-2);
}

.app-subtitle {
  display: block;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
}

.app-description {
  font-size: var(--text-lg);
  color: var(--color-gray-600);
  margin-bottom: var(--space-8);
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: center;
}

@media (min-width: 640px) {
  .quick-actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
```

### projects/cleanbox/cleanbox-app/app/pages/index.vue

```vue
<template>
  <!-- Background effect (Cleanbox) -->
  <EffectsBubbles />

  <div>
    <LandingShell>
      <template #left>
        <LandingHero
          :title="hero.title"
          :accent="hero.accent"
          :paragraph="hero.paragraph"
          :badges="hero.badges"
          :primary="hero.primary"
          :secondary="hero.secondary"
          :tertiary="hero.tertiary"
          :bullets="hero.bullets"
        />
      </template>

      <template #right>
        <LandingQuickPeek
          :title="quickPeek.title"
          :subtitle="quickPeek.subtitle"
          :cta="quickPeek.cta"
          :items="quickPeek.items"
          :footer="quickPeek.footer"
        />
      </template>
    </LandingShell>

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
  title: 'Cleanbox — Cleaning operations you can trust',
  description: 'Schedule, verify, and invoice every clean with confidence.',
})

const hero = {
  title: 'Bling with',
  accent: 'Operational Clarity',
  paragraph:
    'Coordinate crews, quality checks, and billing from one dashboard. Cleanbox keeps every service <span class="text-primary">scheduled</span>, <span class="text-primary">verified</span>, and <span class="text-primary">client-ready</span>.',
  badges: [
    { src: '/logo-type-light.png', alt: 'Flagship tenant' },
    { src: '/logo-type-light.png', alt: 'Flagship tenant' },
  ],
  primary: { label: 'Get Started', to: '/get-started' },
  secondary: { label: 'Explore Crews', to: '/crews' },
  tertiary: undefined,
  bullets: [
    {
      icon: 'i-lucide-calendar-range',
      text: 'Smart scheduling &amp; crew assignments',
    },
    {
      icon: 'i-lucide-clipboard-check',
      text: 'QA checklists with photo proof',
    },
    {
      icon: 'i-lucide-badge-check',
      text: 'Compliance &amp; certification tracking',
    },
    {
      icon: 'i-lucide-wallet-cards',
      text: 'Stripe-ready invoicing &amp; exports',
    },
  ],
}

const quickPeek = {
  title: 'Ops at a Glance',
  subtitle: 'Dispatch, QA, and billing updates for crews across properties',
  cta: {
    label: 'Explore the Dashboard',
    to: '/dashboard',
    icon: 'i-lucide-layout-dashboard',
  },
  items: [
    {
      icon: 'i-lucide-calendar-check',
      title: 'Real-Time Scheduling',
      subtitle: 'Crew and clean teams see updates instantly',
      description:
        'Assign shifts, sync routes, and handle fill-ins from a single board. Cleanbox watches workloads and alerts you to coverage gaps.',
    },
    {
      icon: 'i-lucide-image',
      title: 'QA with Photo Receipts',
      subtitle: 'Automate sign-offs and client updates',
      description:
        'Every job checks in with location-tagged photos and notes. Ready to share with clients, managers, and compliance reviewers.',
    },
    {
      icon: 'i-lucide-wallet',
      title: 'Billing That Syncs',
      subtitle: 'Ready for Stripe, ACH, and 30-day payments',
      description:
        'Generate invoices from service logs and auto-attach QA proof. Export to accounting or use FireUX as your hub for payouts.',
    },
    {
      icon: 'i-lucide-users-2',
      title: 'Crew Experience',
      subtitle: 'Keep top crews booked and motivated',
      description:
        'Give crew leads direct access to schedules, QA feedback, and earnings. Stop juggling text threads and spreadsheets.',
    },
  ],
  footer: {
    title: 'Need rollout support?',
    subtitle: 'Our team helps onboard markets and sync your tooling in weeks.',
    cta: { label: 'Talk to Sales', to: '/sales', icon: 'i-lucide-headset' },
  },
}

const solutions = {
  title: 'Solutions',
  subtitle: 'Scheduling, QA, and billing tools built for cleaning teams.',
  items: [
    {
      title: 'Scheduling',
      description:
        'Smart rota planning and crew assignments across properties.',
      to: '/scheduling',
      cta: 'Plan jobs',
      icon: 'i-lucide-calendar-range',
    },
    {
      title: 'QA & Proof',
      description: 'Photo checklists, geo stamps, and client-ready updates.',
      to: '/qa',
      cta: 'Capture QA',
      icon: 'i-lucide-clipboard-check',
    },
    {
      title: 'Compliance',
      description: 'Training records, certifications, and incident tracking.',
      to: '/compliance',
      cta: 'Review',
      icon: 'i-lucide-badge-check',
    },
    {
      title: 'Billing',
      description: 'Hours, consumables, and Stripe-ready invoicing.',
      to: '/billing',
      cta: 'Invoice',
      icon: 'i-lucide-wallet-cards',
    },
    {
      title: 'Clients',
      description: 'Manage SLAs, site notes, and client portal access.',
      to: '/clients',
      cta: 'Manage',
      icon: 'i-lucide-building-2',
    },
    {
      title: 'Reports',
      description: 'KPIs, exports, and audit-ready summaries.',
      to: '/reports',
      cta: 'Export',
      icon: 'i-lucide-file-chart-column',
    },
  ],
}
</script>
```

### projects/cleanbox/richies-reinigung/app/pages/index.vue

```vue
<template>
  <div class="app-dashboard">
    <section class="welcome-section">
      <div class="welcome-content">
        <h1 class="app-title">
          <span class="brand-name">Richies Reinigung</span>
          <span class="app-subtitle">Trusted Cleaning for Homes & Offices</span>
        </h1>

        <p class="app-description">
          Book one-off or recurring cleans, coordinate your team, and keep
          client relationships on track — all in one place.
        </p>

        <div class="quick-actions">
          <UButton
            to="/professionals"
            variant="solid"
            color="primary"
            size="lg"
          >
            <UIcon name="i-lucide-users" />
            Meet Our Professionals
          </UButton>
          <UButton
            to="/professionals#services"
            variant="outline"
            color="primary"
            size="lg"
          >
            <UIcon name="i-lucide-sparkles" />
            Our Services
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Richies Reinigung – Professional Cleaning Services',
  description:
    'Trusted home and office cleaning. Schedule services, manage staff, and keep clients happy in one place.',
})

definePageMeta({
  layout: 'default',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})
</script>

<style scoped>
.app-dashboard {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.welcome-section {
  text-align: center;
  max-width: 600px;
}

.app-title {
  margin-bottom: var(--space-6);
}

.brand-name {
  display: block;
  font-size: var(--text-5xl);
  font-weight: var(--font-weight-black);
  color: var(--color-primary-600);
  margin-bottom: var(--space-2);
}

.app-subtitle {
  display: block;
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
}

.app-description {
  font-size: var(--text-lg);
  color: var(--color-gray-600);
  margin-bottom: var(--space-8);
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: center;
}

@media (min-width: 640px) {
  .quick-actions {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
```

### projects/cleanbox/richies-reinigung/app/pages/professionals.vue

```vue
<template>
  <UContainer class="professionals-page">
    <header class="page-header">
      <h1>Cleaning Professionals</h1>
      <p>
        Explore the team, view upcoming availability, and invite new cleaners to
        join Richies Reinigung.
      </p>
    </header>

    <section class="cta-grid">
      <UCard>
        <template #header>Team Directory</template>
        <p class="card-copy">
          Review profiles, update specialties, and manage contact details for
          your cleaning crew.
        </p>
        <UButton color="primary" variant="solid" block disabled>
          View Team (coming soon)
        </UButton>
      </UCard>

      <UCard id="services">
        <template #header>Service Catalog</template>
        <p class="card-copy">
          Maintain the list of services on offer, including pricing and duration
          so booking flows stay accurate.
        </p>
        <UButton color="primary" variant="outline" block disabled>
          Manage Services (coming soon)
        </UButton>
      </UCard>
    </section>
  </UContainer>
</template>

<script setup>
useSeoMeta({
  title: 'Richies Reinigung – Cleaning Professionals',
  description:
    'Overview of cleaning professionals and service catalog for Richies Reinigung.',
})

definePageMeta({
  layout: 'default',
  nav: {
    key: 'professionals',
    label: 'Professionals',
    icon: 'i-lucide-users',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})
</script>

<style scoped>
.professionals-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: var(--space-10) 0;
}

.page-header {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.page-header h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-primary-700);
}

.page-header p {
  color: var(--color-gray-600);
  line-height: 1.6;
}

.cta-grid {
  display: grid;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .cta-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.card-copy {
  color: var(--color-gray-600);
  line-height: 1.6;
  margin-bottom: var(--space-4);
}
</style>
```

### packages/tenants/fireux-misebox/src/runtime/pages/dev/index.vue

```vue
<template>
  <div class="page">
    <UCard>
      <template #header>
        <h1>Development Tools</h1>
      </template>
      <p>
        The Dev menu shows all tools for this tenant and extensions. Pick from
        the navigation.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Development Tools',
  layout: 'dev',
  nav: {
    key: 'dev-tenant-index',
    label: 'Tenant Overview',
    icon: 'i-lucide-wrench',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})
</script>
```

### packages/tenants/fireux-misebox/src/runtime/pages/dev/fireux-misebox.vue

```vue
<template>
  <div>
    <UCard>
      <template #header>
        <h1>🍳 Global Chefs Collection</h1>
      </template>
      <p>Total Global Chefs: {{ globalChefs?.length || 0 }}</p>
      <DevJson
        :data="{ total: globalChefs?.length || 0, chefs: globalChefs }"
        title="Global Chefs JSON"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Chef (global)</h2>
        </template>
        <DevJson
          :data="profile.current?.global || null"
          title="Current Global Chef"
        />
      </UCard>
    </div>

    <UCard style="margin-top: 16px">
      <template #header>
        <h1>🚚 Global Suppliers Collection</h1>
      </template>
      <p>Total Global Suppliers: {{ globalSuppliers?.length || 0 }}</p>
      <DevJson
        :data="{
          total: globalSuppliers?.length || 0,
          suppliers: globalSuppliers,
        }"
        title="Global Suppliers JSON"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Supplier (global)</h2>
        </template>
        <DevJson
          :data="supplierProfile.current?.global || null"
          title="Current Global Supplier"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup>
// Read-only global view using the unified profile composable
import { ref, onMounted } from 'vue'
import { chefConfig } from '../../models/profiles/Chef.model'
import { supplierConfig } from '../../models/profiles/Supplier.model'
definePageMeta({
  layout: 'dev',
  alias: ['/dev/fireux-misebox-tennant'],
  nav: {
    key: 'dev-tenant-misebox-global',
    label: 'Misebox Global',
    icon: 'i-lucide-globe-2',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})

// Use the useProfile composable to fetch global chefs
const profile = useProfile(chefConfig)
onMounted(() => {
  // Ensure global list is loaded in both roles
  profile.collection?.fetchGlobal?.()
})
// Ref of the global collection array; fallback to empty ref for SSR safety
const globalChefs = profile.collection?.fetchGlobal?.() ?? ref([])

// Suppliers: mirror the same pattern for global view
const supplierProfile = useProfile(supplierConfig)
onMounted(() => {
  supplierProfile.collection?.fetchGlobal?.()
})
const globalSuppliers = supplierProfile.collection?.fetchGlobal?.() ?? ref([])
</script>
```

### packages/tenants/fireux-misebox/src/runtime/pages/dashboard/chef-profile.vue

```vue
<template>
  <UPage>
    <UPageBody>
      <OrganismsProfileRoot :config="chefConfig">
        <!-- When a profile exists, render the editor -->
        <template #current-assets="{ profile }">
          <div v-if="profile">
            <h2 class="mb-4">Edit Chef Profile</h2>
            <OrganismsProfilesChefEdit :chef="profile" />
          </div>
        </template>

        <!-- Optional: omit list rendering by leaving #item empty -->
        <template #item></template>
      </OrganismsProfileRoot>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Nuxt macro type hint for package-level typecheck
declare function definePageMeta(meta: any): void
import { chefConfig } from '../../models/profiles/Chef.model'
// pages/dashboard/chef-profile.vue (same pattern for others)
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-chef-profile',
    label: 'Chef Profile',
    icon: 'i-lucide-chef-hat',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'chef', // expose to useNav
  },
  requiresAuth: true,
})
</script>
```

### packages/tenants/fireux-misebox/src/runtime/pages/dashboard/supplier-profile.vue

```vue
<template>
  <UPage>
    <UPageBody>
      <OrganismsProfileRoot :config="supplierConfig">
        <!-- When a profile exists, render the editor -->
        <template #current-assets="{ profile }">
          <div v-if="profile">
            <h2 class="mb-4">Edit Supplier Profile</h2>
            <MiseProfilesSupplierEdit :supplier="profile" />
          </div>
        </template>

        <!-- Optional: omit list rendering by leaving #item empty -->
        <template #item></template>
      </OrganismsProfileRoot>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void
import { supplierConfig } from '../../models/profiles/Supplier.model'
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-supplier-profile',
    label: 'Supplier Profile',
    icon: 'i-lucide-package',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'supplier',
  },
  requiresAuth: true,
})
</script>
```

## Layout Targeting Rationale

The `layouts` arrays inside each `definePageMeta` block are deliberate. The unified `useNav` composable accepts a target layout (defaulting to `'default'`) and filters route metadata so navigation renders only when the active layout matches a declared value. Preset wrappers such as `useDashboardNav` and `useLandingNav` simply pass the relevant layout keys. By tagging landing experiences with `layouts: ['landing']`, defaults with `['default']`, dashboards with `['dashboard']`, and development tools with `['dev']`, we keep:

- Tenant-branded landing pages isolated from authenticated dashboards.
- Dashboard-only affordances (like profile editors) out of public menus while still available to `useNav(['dashboard'])` consumers.
- Dev utilities hidden from production layouts without relying on role checks alone.
- A consistent contract for future layouts: adding a new layout only requires passing its key to `useNav` or extending layout-specific menus, without retrofitting every route.
