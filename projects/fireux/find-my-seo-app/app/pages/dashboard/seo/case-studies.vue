<template>
  <UDashboardPanel>
    <template #header>
      <LayoutsConsoleNavbar title="Case studies" />
    </template>

    <template #body>
      <div class="space-y-4">
        <UCard v-for="study in seoCaseStudies" :key="study.id">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-2">
              <p class="text-lg font-semibold">{{ study.title }}</p>
              <p class="text-sm text-dimmed">{{ ownerName(study.ownerEntityId) }} · {{ study.clientType }} · {{ study.timeframeLabel }}</p>
              <p class="text-sm leading-6 text-toned">{{ study.problem }}</p>
            </div>
            <div class="flex gap-3">
              <UButton variant="soft">Edit</UButton>
              <UButton variant="ghost">Preview</UButton>
            </div>
          </div>
        </UCard>

        <UButton color="primary">Add case study</UButton>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { seoCaseStudies, seoProviders } from '../../../content/findMySeo'

definePageMeta({
  layout: 'dashboard',
  requiresAuth: true,
})

const ownerName = (providerId: string) =>
  seoProviders.find((provider) => provider.id === providerId)?.displayName ?? 'SEO provider'
</script>
