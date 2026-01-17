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

  <UContainer>
    <UPageSection class="py-12 lg:py-16">
      <div class="flex items-end justify-between mb-6">
        <div>
          <h2 class="text-2xl lg:text-3xl font-bold">Our apps</h2>
          <p class="text-[color:var(--ui-text-muted)] mt-1">
            Avatars for every registered app.
          </p>
        </div>
        <UBadge variant="soft" color="primary">{{ displayedApps.length }}</UBadge>
      </div>

      <div v-if="appsPending" class="flex flex-wrap gap-2">
        <USkeleton class="h-10 w-10 rounded-full" />
        <USkeleton class="h-10 w-10 rounded-full" />
        <USkeleton class="h-10 w-10 rounded-full" />
        <USkeleton class="h-10 w-10 rounded-full" />
        <USkeleton class="h-10 w-10 rounded-full" />
        <USkeleton class="h-10 w-10 rounded-full" />
      </div>

      <div v-else class="flex flex-wrap gap-2">
        <UAvatar
          v-for="app in displayedApps"
          :key="app.key"
          :src="app.src"
          :alt="app.name"
          :text="app.text"
          size="md"
        />
      </div>
    </UPageSection>
  </UContainer>

  <LandingFuel />
  <LandingFeatures first />
  <LandingSkillsIcons />
</template>

<script setup lang="ts">
import { useAvatarProxy } from 'fireux-core/runtime/composables/fireux/app/ui/useAvatarProxy.ts'
import { computed, onMounted, ref } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'

type LandingProductItem = {
  title: string
  description: string
  to: string
  logo?: string
  tag?: string
  tagColor?: 'primary' | 'neutral' | 'sky' | 'violet' | 'amber'
}

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

const { getProxiedAvatarUrl } = useAvatarProxy()

type AppInfoResponse = {
  ok?: boolean
  app?: {
    id?: string
    name?: string
    shortName?: string
    ecosystem?: string
    role?: string
    modules?: string[]
    logo?: string
    appIcon?: string
  }
  package?: {
    name?: string
    version?: string
  }
}

type AppKey =
  | 'fireux'
  | 'misebox'
  | 'cleanbox'
  | 'niederhorn'
  | 'richies'
  | 'tenant'

const CANONICAL_APPS: Array<{ key: AppKey; name: string }> = [
  { key: 'fireux', name: 'FireUX' },
  { key: 'misebox', name: 'Misebox' },
  { key: 'cleanbox', name: 'Cleanbox' },
  { key: 'niederhorn', name: 'Niederhorn' },
  { key: 'richies', name: 'Richies' },
  { key: 'tenant', name: 'Tenant' },
]

const runtimeConfig = useRuntimeConfig()
const publicApps = (runtimeConfig.public as any)?.apps as
  | Partial<Record<AppKey, string>>
  | undefined

const devBaseUrl = (key: AppKey) => {
  const ports: Record<AppKey, number> = {
    fireux: 3000,
    misebox: 3001,
    cleanbox: 3002,
    niederhorn: 3003,
    richies: 3004,
    tenant: 3005,
  }
  return `http://localhost:${ports[key]}`
}

const baseUrlFor = (key: AppKey) => {
  if (import.meta.dev) return devBaseUrl(key)
  const raw = publicApps?.[key]
  return typeof raw === 'string' && raw.trim() ? raw.trim().replace(/\/+$/, '') : ''
}

const infoByKey = ref<Partial<Record<AppKey, AppInfoResponse>>>({})
const infoPending = ref(false)
const appsPending = computed(() => infoPending.value)

const initials = (name: string) =>
  name
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

const resolveIconUrl = (base: string, icon: string) => {
  const trimmed = icon.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('/') && base) return `${base}${trimmed}`
  return trimmed
}

const DEFAULT_LOGO_PATH = '/img/app/logo.png'

const fetchAllAppInfo = async () => {
  if (typeof window === 'undefined') return
  infoPending.value = true
  try {
    await Promise.all(
      CANONICAL_APPS.map(async ({ key }) => {
        const base = baseUrlFor(key)
        if (!base) return
        try {
          const res = await fetch(`${base}/api/app/info`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          })
          if (!res.ok) {
            if (import.meta.dev) {
              console.warn(`[fireux] /api/app/info failed for ${key}: ${res.status}`)
            }
            return
          }
          const json = (await res.json()) as AppInfoResponse
          infoByKey.value[key] = json
        } catch (e) {
          if (import.meta.dev) {
            console.warn(`[fireux] /api/app/info threw for ${key}:`, e)
          }
        }
      })
    )
  } finally {
    infoPending.value = false
  }
}

onMounted(() => {
  void fetchAllAppInfo()
})

const displayedApps = computed(() =>
  CANONICAL_APPS.map((app) => {
    const base = baseUrlFor(app.key)
    const info = infoByKey.value[app.key]
    const logo = info?.app?.logo ?? info?.app?.appIcon ?? DEFAULT_LOGO_PATH
    const resolved = resolveIconUrl(base, logo)
    if (import.meta.dev && base && !resolved) {
      console.warn(`[fireux] No logo resolved for ${app.key}.`) 
    }
    return {
      key: app.key,
      name: app.name,
      src: getProxiedAvatarUrl(resolved),
      text: initials(app.name),
    }
  })
)

const title = 'Ignite With'
const accent = 'Powerful Applications'
const paragraph =
  'A low-code ecosystem for responsive, scalable, and data-driven applications built upon <span class="text-primary">Nuxt4</span> &amp; <span class="text-primary">Firebase</span>.'

const badges = [
  { src: '/img/stack/nuxt-white.png', alt: 'Nuxt' },
  { src: '/img/stack/firebase-white.png', alt: 'Firebase' },
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
    logo: '/img/app/logo.png',
    tag: 'Ops',
    tagColor: 'sky',
  },
  {
    title: 'Misebox',
    description: 'Recipes, inventory, suppliers.',
    to: '/misebox',
    logo: '/img/app/logo.png',
    tag: 'Kitchen',
    tagColor: 'violet',
  },
  {
    title: 'FireUX',
    description: 'Nuxt + Firebase + Stripe core.',
    to: '/core',
    logo: '/img/app/logo.png',
    tag: 'Core',
    tagColor: 'primary',
  },
] satisfies LandingProductItem[]
</script>
