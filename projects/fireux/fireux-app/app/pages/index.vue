<template>
  <EffectsStars />
  <LandingHeroSection />

  <!-- Core solutions grid -->
  <LandingSolutions
    :title="solutions.title"
    :subtitle="solutions.subtitle"
    :items="solutions.items"
  />

  <!-- Sections to ship now -->
  <LandingProducts :items="products" />

  <UPageSection class="py-12 lg:py-16 space-y-10">
    <section>
      <div class="flex items-end justify-between mb-6">
        <div>
          <h2 class="text-2xl lg:text-3xl font-bold">Our apps</h2>
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
        <UTooltip
          v-for="app in displayedApps"
          :key="app.key"
          :text="app.name"
        >
          <a
            v-if="app.href"
            :href="app.href"
            :aria-label="`Open ${app.name}`"
            class="inline-flex rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <UAvatar
              :src="app.src"
              :alt="app.name"
              :text="app.text"
              size="md"
            />
          </a>
          <UAvatar
            v-else
            :src="app.src"
            :alt="app.name"
            :text="app.text"
            size="md"
          />
        </UTooltip>
      </div>
    </section>

    <section>
      <div class="flex items-end justify-between mb-6">
        <div>
          <h2 class="text-2xl lg:text-3xl font-bold">Our Ecosystems</h2>
        </div>
        <UBadge variant="soft" color="primary">{{ displayedEcosystems.length }}</UBadge>
      </div>

      <div v-if="appsPending" class="flex flex-wrap gap-2">
        <USkeleton class="h-10 w-10 rounded-lg" />
        <USkeleton class="h-10 w-10 rounded-lg" />
        <USkeleton class="h-10 w-10 rounded-lg" />
        <USkeleton class="h-10 w-10 rounded-lg" />
      </div>

      <div v-else class="flex flex-wrap gap-2">
        <UTooltip
          v-for="ecosystem in displayedEcosystems"
          :key="ecosystem.key"
          :text="ecosystem.name"
        >
          <a
            v-if="ecosystem.href"
            :href="ecosystem.href"
            :aria-label="`Open ${ecosystem.name}`"
            class="inline-flex rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <UAvatar
              :src="ecosystem.src"
              :alt="ecosystem.name"
              :text="ecosystem.text"
              size="md"
              class="rounded-lg"
            />
          </a>
          <UAvatar
            v-else
            :src="ecosystem.src"
            :alt="ecosystem.name"
            :text="ecosystem.text"
            size="md"
            class="rounded-lg"
          />
        </UTooltip>
      </div>
    </section>
  </UPageSection>

  <LandingFuel />
  <LandingFeatures first />
  <LandingSkillsIcons />
</template>

<script setup lang="ts">
import { useAvatarProxy } from 'fireux-core/runtime/composables/fireux/app/ui/useAvatarProxy.ts'
import { useRuntimeConfig } from 'nuxt/app'
import { computed, onMounted, ref } from 'vue'

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
    appThumbnail?: string
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

const normalizeSlug = (value: string) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const toDisplayName = (value: string) => {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  if (trimmed.toLowerCase() === 'fireux') return 'FireUX'
  return trimmed
    .split(/[\s-_]+/g)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}

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
    const logo = info?.app?.logo ?? info?.app?.appThumbnail ?? DEFAULT_LOGO_PATH
    const resolved = resolveIconUrl(base, logo)
    if (import.meta.dev && base && !resolved) {
      console.warn(`[fireux] No logo resolved for ${app.key}.`) 
    }
    return {
      key: app.key,
      name: app.name,
      src: getProxiedAvatarUrl(resolved),
      text: initials(app.name),
      href: base || '',
      ecosystem: String(info?.app?.ecosystem || '').trim(),
    }
  })
)

const displayedEcosystems = computed(() => {
  const byKey = new Map<
    string,
    { key: string; name: string; src: string; text: string; href: string }
  >()

  for (const app of displayedApps.value) {
    const slug = normalizeSlug(app.ecosystem)
    if (!slug || byKey.has(slug)) continue

    const name = toDisplayName(app.ecosystem)
    byKey.set(slug, {
      key: slug,
      name: name || app.ecosystem || app.name,
      src: app.src,
      text: initials(name || app.name),
      href: app.href,
    })
  }

  return Array.from(byKey.values())
})

const solutions = {
  title: 'Get started',
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
