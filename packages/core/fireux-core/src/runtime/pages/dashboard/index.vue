<template>
  <UDashboardPanel id="home">
    <template #header>
      <LayoutsDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }" />
    </template>

    <template #body>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UCard v-for="entry in dashboardEntries" :key="entry.to">
          <div class="space-y-4">
            <div class="flex items-start gap-3">
              <UIcon :name="entry.icon" class="mt-1 size-5 text-primary" />
              <div class="min-w-0 space-y-1">
                <p class="font-semibold">{{ entry.title }}</p>
                <p class="text-sm leading-6 text-toned">{{ entry.description }}</p>
              </div>
            </div>

            <UButton :to="entry.to" variant="soft">
              {{ entry.cta }}
            </UButton>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports';
import { computed } from 'vue'
import { useDashboardNav } from '../../composables/fireux/app/ui/nav/useDashboardNav'

definePageMeta({
  nav: {
    key: 'dashboard-home',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    position: 'top',
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  layout: 'dashboard',
})

const { activeProfileEntries } = useDashboardNav()

const dashboardEntries = computed(() => [
  {
    title: 'Profile',
    description: 'Manage your personal account profile.',
    to: '/dashboard/user-profile',
    cta: 'Open profile',
    icon: 'i-lucide-user',
  },
  ...activeProfileEntries.value.map((entry) => ({
    title: entry.label,
    description: 'Manage this profile extension.',
    to: entry.to,
    cta: 'Open profile',
    icon: entry.icon || 'i-lucide-user',
  })),
])
</script>
