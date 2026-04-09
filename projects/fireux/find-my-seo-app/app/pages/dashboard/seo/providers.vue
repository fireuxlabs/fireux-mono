<template>
  <UPage>
    <UPageHeader
      title="Providers"
      description="Review and edit provider listings."
    />

    <UPageBody>
      <div class="space-y-4">
        <UCard v-for="provider in seoProviders" :key="provider.id">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-lg font-semibold">{{ provider.displayName }}</p>
                <UBadge variant="soft">{{ providerLabel(provider) }}</UBadge>
                <UBadge v-if="provider.isFeatured" color="primary" variant="soft">Featured</UBadge>
                <UBadge v-if="provider.isVerified" color="success" variant="soft">Verified</UBadge>
              </div>
              <p class="text-sm text-dimmed">{{ provider.headline }}</p>
              <p class="text-sm leading-6 text-toned">{{ provider.summary }}</p>
            </div>
            <div class="flex gap-3">
              <UButton :to="`/dashboard/seo/profile?provider=${provider.slug}`" variant="soft">Edit listing</UButton>
              <UButton :to="`/seo-providers/${provider.slug}`" variant="ghost">Preview</UButton>
            </div>
          </div>
        </UCard>

        <UButton color="primary">Add provider</UButton>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { providerLabel, seoProviders } from '../../../content/findMySeo'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
})
</script>
