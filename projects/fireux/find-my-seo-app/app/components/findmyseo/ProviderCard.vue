<template>
  <UCard class="h-full">
    <div class="space-y-4">
      <div class="space-y-2">
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-lg font-semibold">{{ provider.displayName }}</p>
              <UBadge color="neutral" variant="soft">{{ providerTypeLabel }}</UBadge>
              <UBadge v-if="provider.isFeatured" color="primary" variant="soft">Featured</UBadge>
              <UBadge v-if="provider.isVerified" color="success" variant="soft">Verified</UBadge>
            </div>
            <p class="text-sm text-dimmed">
              {{ provider.headline }}
            </p>
          </div>
          <UBadge color="neutral" variant="soft">{{ provider.availabilityStatus }}</UBadge>
        </div>

        <p class="text-sm leading-6 text-toned">{{ provider.summary }}</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="item in provider.specialisms"
          :key="item"
          color="primary"
          variant="subtle"
        >
          {{ item }}
        </UBadge>
      </div>

      <div class="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <span class="text-dimmed">Sector fit:</span>
          {{ provider.sectorExperience.join(', ') }}
        </div>
        <div>
          <span class="text-dimmed">Projects:</span>
          {{ provider.projectTypes.join(', ') }}
        </div>
        <div>
          <span class="text-dimmed">Format:</span>
          {{ provider.remoteAvailable ? 'Remote-friendly' : provider.locationLabel }}
        </div>
        <div>
          <span class="text-dimmed">Pricing:</span>
          {{ provider.pricingGuidance }}
        </div>
      </div>

      <p v-if="provider.trustNote" class="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-toned">
        {{ provider.trustNote }}
      </p>

      <div class="flex gap-3">
        <UButton :to="`/seo-providers/${provider.slug}`" color="primary">
          View profile
        </UButton>
        <UButton variant="soft" :to="`/seo-providers/${provider.slug}#enquire`">
          Request quote
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SeoProvider } from '../../content/findMySeo'
import { providerLabel } from '../../content/findMySeo'

const props = defineProps<{
  provider: SeoProvider
}>()

const providerTypeLabel = computed(() => providerLabel(props.provider))
</script>
