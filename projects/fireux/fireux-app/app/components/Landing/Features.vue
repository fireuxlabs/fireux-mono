<template>
  <div class="landing-index-section">
    <div class="mb-6 space-y-2 text-center">
      <h2 class="text-2xl lg:text-3xl font-bold">What FireUX Gives You</h2>
      <p class="mx-auto max-w-2xl text-muted">
        Build, launch, and run applications on one platform.
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
        <p class="text-sm text-muted">
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
    title: 'Installable Anywhere',
    description: 'Use your app across phones and computers without waiting for an app store.',
  },
  {
    key: 'templates',
    icon: 'i-lucide-square-dashed',
    title: 'Proven Starting Points',
    description: 'Begin with working FireUX foundations instead of paying for a blank-sheet build.',
  },
  {
    key: 'saas',
    icon: 'i-lucide-cloud',
    title: 'Managed for You',
    description: 'We keep the platform, hosting, and shared foundations moving forward.',
  },
  {
    key: 'whitelabel',
    icon: 'i-lucide-layers-2',
    title: 'Your Brand',
    description: 'Launch a focused customer-facing app with your own identity and content.',
  },
  {
    key: 'low-code',
    icon: 'i-lucide-code',
    title: 'Built to Grow',
    description: 'Add capabilities when the business proves it needs them, not before.',
  },
  {
    key: 'workspace',
    icon: 'i-lucide-terminal',
    title: 'One Control Centre',
    description: 'Manage the work, people, and connected apps from a consistent workspace.',
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
