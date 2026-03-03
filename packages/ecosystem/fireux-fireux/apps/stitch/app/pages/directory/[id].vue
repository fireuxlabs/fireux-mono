<template>
  <UPage>
    <UPageBody class="pagebody space-y-4 py-6">
      <UButton to="/directory" color="neutral" variant="ghost" icon="i-lucide-arrow-left">Back to directory</UButton>

      <USkeleton v-if="pending" class="h-80 rounded-lg" />

      <UAlert v-else-if="!provider" color="error" variant="subtle" title="Provider not found" description="This provider profile is unavailable or has been removed." />

      <template v-else>
        <UCard>
          <template #header>
            <div class="space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <h1 class="text-2xl font-semibold">{{ provider.display_name }}</h1>
                <div class="flex items-center gap-2">
                  <UBadge :label="provider.type" color="neutral" variant="soft" />
                  <UBadge :label="provider.availability" :color="availabilityColor(provider.availability)" variant="soft" />
                </div>
              </div>
              <p class="text-sm text-muted">{{ [provider.location, provider.timezone].filter(Boolean).join(' · ') || 'Location not listed' }}</p>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-sm leading-relaxed text-muted">{{ provider.bio || 'This provider has not added a public bio yet.' }}</p>

            <div class="flex flex-wrap gap-2">
              <UBadge v-for="tag in provider.tags" :key="tag" :label="tag" color="primary" variant="subtle" />
            </div>

            <div class="flex flex-wrap items-center gap-2">
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
              <UButton
                v-if="provider.contact_email"
                :to="`mailto:${provider.contact_email}`"
                color="primary"
                variant="soft"
                icon="i-lucide-mail"
              >
                Contact
              </UButton>
              <UButton to="/console/requests" color="primary" icon="i-lucide-briefcase-business">Request capacity</UButton>
              <UButton
                v-if="canEdit"
                :to="`/console/providers/${provider.id}`"
                color="neutral"
                variant="outline"
                icon="i-lucide-pencil"
              >
                Edit
              </UButton>
            </div>
          </div>
        </UCard>
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import type { StitchProviderAvailability } from '../../models/stitch.provider.model'

const route = useRoute()
const id = computed(() => String(route.params.id || ''))

const { provider, pending } = useStitchProvider(id)
const { uid } = useAuth()
const { isAdmin } = useUser()

const canEdit = computed(() => {
  if (!provider.value) return false
  return provider.value.created_by_uid === uid.value || isAdmin.value
})

const availabilityColor = (availability: StitchProviderAvailability) => {
  if (availability === 'available') return 'success'
  if (availability === 'limited') return 'warning'
  return 'error'
}
</script>
