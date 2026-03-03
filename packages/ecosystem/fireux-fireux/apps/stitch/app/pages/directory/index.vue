<template>
  <UPage>
    <UPageHeader title="Provider directory" description="Connect with SEO specialists and agencies that have capacity." />

    <UPageBody class="pagebody space-y-4">
      <UCard>
        <div class="grid gap-3 md:grid-cols-2">
          <UInput v-model="search" icon="i-lucide-search" placeholder="Search name, website, or bio" />
          <USelect v-model="selectedTags" :items="tagOptions" multiple placeholder="Filter by tags" />
        </div>
      </UCard>

      <USeparator />

      <div v-if="pending" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <USkeleton v-for="idx in 6" :key="idx" class="h-52 rounded-lg" />
      </div>

      <UAlert
        v-else-if="!providers.length"
        color="neutral"
        variant="subtle"
        title="No providers found"
        description="Try a broader search or remove one of your tag filters."
      />

      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UCard v-for="provider in providers" :key="provider.id" class="space-y-4">
          <template #header>
            <div class="space-y-2">
              <div class="flex items-center justify-between gap-3">
                <p class="text-lg font-semibold leading-tight">{{ provider.display_name }}</p>
                <UBadge :label="provider.type" color="neutral" variant="soft" />
              </div>
              <div class="flex items-center gap-2">
                <UBadge :label="provider.availability" :color="availabilityColor(provider.availability)" variant="soft" />
                <UBadge v-if="provider.is_verified" label="verified" color="success" variant="soft" />
              </div>
            </div>
          </template>

          <p class="line-clamp-3 text-sm text-muted">{{ provider.bio || 'No bio added yet.' }}</p>

          <div class="flex flex-wrap gap-2">
            <UBadge v-for="tag in provider.tags" :key="tag" :label="tag" color="primary" variant="subtle" />
          </div>

          <p class="text-xs text-muted">{{ [provider.location, provider.timezone].filter(Boolean).join(' · ') || 'Location not listed' }}</p>

          <div class="flex flex-wrap items-center gap-2">
            <UButton :to="`/directory/${provider.id}`" color="primary" variant="soft" icon="i-lucide-arrow-up-right">View profile</UButton>
            <UButton
              v-if="provider.website_url"
              :to="provider.website_url"
              target="_blank"
              rel="noopener noreferrer"
              color="neutral"
              variant="outline"
              icon="i-lucide-globe"
            >
              Website
            </UButton>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { STITCH_TAG_OPTIONS } from '../../constants/stitch.tags'
import type { StitchProviderAvailability } from '../../models/stitch.provider.model'

const search = ref('')
const selectedTags = ref<string[]>([])

const { filteredProviders, availableTags, pending } = useStitchProviders({
  onlyPublic: true,
  search,
  tags: selectedTags,
})

const providers = computed(() => filteredProviders.value)

const tagOptions = computed(() => {
  const dynamic = availableTags.value
  if (!dynamic.length) return STITCH_TAG_OPTIONS

  const merged = new Set([...STITCH_TAG_OPTIONS.map((opt) => opt.value), ...dynamic])
  return [...merged]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ label: value, value }))
})

const availabilityColor = (availability: StitchProviderAvailability) => {
  if (availability === 'available') return 'success'
  if (availability === 'limited') return 'warning'
  return 'error'
}
</script>
