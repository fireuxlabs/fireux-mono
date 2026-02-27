<template>
  <div class="landing-index-section">
    <div class="mb-6 space-y-2 text-center">
      <h2 class="text-2xl lg:text-3xl font-bold">FireUX Features</h2>
      <p class="mx-auto max-w-2xl text-[color:var(--ui-text-muted)]">
        Opinionated tooling that ships real products.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard v-for="f in shown" :key="f.key">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon :name="f.icon" class="text-xl" />
            <h3 class="font-semibold">{{ f.title }}</h3>
          </div>
        </template>
        <p class="text-sm text-[color:var(--ui-text-muted)]">
          {{ f.description }}
        </p>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type FeatureItem = {
  key: string
  icon: string
  title: string
  description: string
}

const props = withDefaults(
  defineProps<{ first?: boolean; second?: boolean; items?: FeatureItem[] }>(),
  {}
)

const defaults: FeatureItem[] = [
  {
    key: 'pwa',
    icon: 'i-lucide-smartphone',
    title: 'PWA First',
    description: 'Installable apps with notifications, no stores.',
  },
  {
    key: 'templates',
    icon: 'i-lucide-square-dashed',
    title: 'Pre-built Templates',
    description: 'UI kits with data wiring: less glue, more ship.',
  },
  {
    key: 'saas',
    icon: 'i-lucide-cloud',
    title: 'SaaS Solutions',
    description: 'Managed subscriptions, billing, and growth.',
  },
  {
    key: 'whitelabel',
    icon: 'i-lucide-layers-2',
    title: 'White-Label',
    description: 'Rebrand and resell with tenant theming.',
  },
  {
    key: 'low-code',
    icon: 'i-lucide-code',
    title: 'Low-Code Core',
    description: 'Composable modules for speed and safety.',
  },
  {
    key: 'console',
    icon: 'i-lucide-terminal',
    title: 'Console-Driven',
    description: 'Clear, data-first layouts and controls.',
  },
  {
    key: 'authpay',
    icon: 'i-lucide-lock',
    title: 'Auth & Payments',
    description: 'Google sign-in and Stripe baked in.',
  },
  {
    key: 'nocookie',
    icon: 'material-symbols-light:cookie-off-outline-rounded',
    title: 'Zero Cookies',
    description: 'No nag banners. Privacy by default.',
  },
  {
    key: 'automation',
    icon: 'i-lucide-zap',
    title: 'Automations',
    description: 'Trigger real-time flows with zero toil.',
  },
  {
    key: 'analytics',
    icon: 'i-lucide-bar-chart',
    title: 'Analytics',
    description: 'Real-time insights and exports.',
  },
  {
    key: 'security',
    icon: 'i-lucide-shield',
    title: 'Security First',
    description: 'Sensible defaults for compliance.',
  },
  {
    key: 'performance',
    icon: 'i-lucide-rocket',
    title: 'Blazing Fast',
    description: 'Lean bundles and instant loads.',
  },
]

const source = computed(() => (props.items?.length ? props.items : defaults))
const shown = computed(() => {
  if (props.first) return source.value.slice(0, 6)
  if (props.second) return source.value.slice(6, 12)
  return source.value.slice(0, 6)
})
</script>
