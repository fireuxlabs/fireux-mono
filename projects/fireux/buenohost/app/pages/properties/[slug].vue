<template>
  <UPage v-if="property">
    <UPageHeader
      :title="property.identity.name"
      :description="property.headline"
    >
      <template #headline>
        <UBadge color="warning" variant="soft">
          Local product simulation
        </UBadge>
      </template>

      <template #links>
        <UButton
          :to="`/properties/${property.slug}/info`"
          color="neutral"
          variant="soft"
          icon="i-lucide-book-open"
        >
          View property info
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div class="space-y-6">
          <img
            :src="property.identity.image_url"
            :alt="property.identity.name"
            class="aspect-[16/9] w-full rounded-lg object-cover"
          />

          <UCard>
            <div class="space-y-4">
              <div>
                <p class="text-sm font-semibold text-primary">
                  {{ property.identity.city || property.identity.country }}
                </p>
                <p class="mt-2 text-sm leading-6 text-toned">
                  {{ property.summary }}
                </p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <p class="text-xs font-semibold uppercase text-muted">
                    Address
                  </p>
                  <p class="mt-1 text-sm">
                    {{ property.manual.welcome.address || property.identity.address_line }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase text-muted">
                    Manager
                  </p>
                  <p class="mt-1 text-sm">
                    {{ property.manual.welcome.manager }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase text-muted">
                    Rate
                  </p>
                  <p class="mt-1 text-sm">
                    {{ property.price_hint }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase text-muted">
                    Availability
                  </p>
                  <p class="mt-1 text-sm">
                    {{ property.availability_hint }}
                  </p>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="amenity in property.amenities"
                  :key="amenity"
                  color="neutral"
                  variant="soft"
                >
                  {{ amenity }}
                </UBadge>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="space-y-3">
              <h2 class="text-xl font-semibold">
                Public information boundary
              </h2>
              <ul class="grid gap-2">
                <li
                  v-for="note in property.public_notes"
                  :key="note"
                  class="flex gap-2 text-sm text-toned"
                >
                  <Icon name="i-lucide-check" class="mt-0.5 size-4 text-primary" />
                  <span>{{ note }}</span>
                </li>
              </ul>
            </div>
          </UCard>
        </div>

        <UCard>
          <div class="space-y-4">
            <h2 class="text-xl font-semibold">Preview only</h2>
            <UAlert
              color="warning"
              variant="soft"
              title="No live property or host"
              description="This route is a local product simulation. Messaging and booking are disabled, and no information is sent or saved."
            />
            <p class="text-sm leading-6 text-toned">
              A live BuenoHost property would connect this surface to its verified owner, private guest access and real availability.
            </p>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>

  <UPage v-else>
    <UPageHeader
      title="Property not found"
      description="This BuenoHost property is unavailable."
    />
    <UPageBody>
      <UButton to="/" color="primary">
        Back to BuenoHost
      </UButton>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: make the fictional property route an explicit read-only simulation.
import { computed } from 'vue'
import { findSimulatedBuenoHostProperty } from '../../simulations/properties'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const property = computed(() => findSimulatedBuenoHostProperty(slug.value))

useSeoMeta({
  title: computed(() =>
    property.value
      ? `${property.value.identity.name} | BuenoHost`
      : 'Property | BuenoHost'
  ),
  description: computed(() =>
    property.value?.summary || 'BuenoHost public property enquiry page.'
  ),
})
</script>
