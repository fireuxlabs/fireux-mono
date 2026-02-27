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
            <NuxtLink to="/scheduling">
              <UBadge variant="soft" color="primary">Scheduling</UBadge>
            </NuxtLink>
            <NuxtLink to="/qa">
              <UBadge variant="soft" color="primary">QA</UBadge>
            </NuxtLink>
            <NuxtLink to="/billing">
              <UBadge variant="soft" color="primary">Billing</UBadge>
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
    title: 'Scheduling',
    copy: 'Plan crews and shifts across properties.',
    icon: 'i-lucide-calendar-check',
  },
  {
    title: 'QA proof',
    copy: 'Photo receipts and sign-off updates.',
    icon: 'i-lucide-image',
  },
  {
    title: 'Billing',
    copy: 'Invoice-ready service logs and exports.',
    icon: 'i-lucide-wallet',
  },
]
</script>
