<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <span>Quick links</span>
        <UBadge variant="subtle" color="neutral">At a glance</UBadge>
      </div>
    </template>

    <ul class="space-y-4">
      <li class="flex items-start gap-3" v-for="item in quickLinks" :key="item.title">
        <div class="grid h-10 w-10 place-items-center rounded-md bg-primary/15 text-primary">
          <UIcon :name="item.icon" />
        </div>
        <div>
          <h3 class="font-medium">{{ item.title }}</h3>
          <p class="text-sm">
            {{ item.copy }}
          </p>
        </div>
      </li>
    </ul>

    <template #footer>
      <div class="space-y-3">
        <ClientOnly>
          <UButton :to="footerAction.to" block color="primary">
            {{ footerAction.label }}
          </UButton>
          <div class="flex flex-wrap gap-2">
            <NuxtLink to="/apps">
              <UBadge variant="soft" color="primary">Apps</UBadge>
            </NuxtLink>
            <NuxtLink to="/modules">
              <UBadge variant="soft" color="primary">Modules</UBadge>
            </NuxtLink>
            <NuxtLink to="/ecosystems">
              <UBadge variant="soft" color="primary">Ecosystems</UBadge>
            </NuxtLink>
          </div>
        </ClientOnly>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const auth = import.meta.client ? useAuth() : null
const isAuthenticated = computed(() => auth?.isAuthenticated?.value ?? false)

const footerAction = computed(() =>
  isAuthenticated.value
    ? { label: 'Go to console', to: '/console' }
    : { label: 'Get started', to: '/get-started' }
)

const quickLinks = [
  {
    title: 'Modules',
    copy: 'Wire Nuxt + Firebase with ready composables.',
    icon: 'i-lucide-puzzle',
  },
  {
    title: 'Tenant theming',
    copy: 'White-label overrides from one config.',
    icon: 'i-lucide-palette',
  },
  {
    title: 'Automation',
    copy: 'PWA, CI presets, and deploy pipelines.',
    icon: 'i-lucide-rocket',
  },
]
</script>
