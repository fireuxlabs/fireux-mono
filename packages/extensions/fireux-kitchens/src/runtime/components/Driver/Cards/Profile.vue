<template>
  <article class="mx-auto w-full max-w-6xl space-y-6">
    <PublicProfileHero
      kind-label="Driver"
      icon="i-lucide-truck"
      :avatar-url="card.avatarUrl"
      :display-name="card.displayName || 'Driver profile'"
      :handle="card.handle"
      :subtitle="profile?.subtitle"
      :title="profile?.title"
      :summary="profile?.tagline || card.summary"
      :labels="profile?.tags || []"
      :stats="profileStats"
    >
      <template #actions>
        <slot name="actions" />
      </template>
    </PublicProfileHero>

    <div class="grid gap-6 md:grid-cols-2">
      <section
        class="rounded-3xl border border-default bg-default p-5 shadow-sm sm:p-7"
      >
        <PublicProfileSectionHeading
          icon="i-lucide-route"
          eyebrow="Service area"
          title="Delivery coverage"
        />
        <div class="mt-6 flex items-end gap-3">
          <div class="text-5xl font-semibold tracking-tight text-highlighted">
            {{ coverageValue }}
          </div>
          <div class="pb-1 text-sm font-medium text-muted">
            {{ coverageUnit }} radius
          </div>
        </div>
        <p class="mt-4 text-sm leading-6 text-toned">
          Available for delivery work within this public service radius. Kitchen
          assignments and contact details stay private.
        </p>
      </section>

      <section
        class="rounded-3xl border border-default bg-default p-5 shadow-sm sm:p-7"
      >
        <PublicProfileSectionHeading
          icon="i-lucide-package-check"
          eyebrow="Delivery profile"
          title="Capabilities"
        />
        <div v-if="profile?.tags.length" class="mt-6 flex flex-wrap gap-2">
          <UBadge
            v-for="tag in profile.tags"
            :key="tag"
            :label="tag"
            color="neutral"
            variant="soft"
          />
        </div>
        <p v-else class="mt-5 text-sm leading-6 text-muted">
          This driver is available through the kitchen delivery network.
        </p>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DriverCard } from '../../../composables/fireux/firestore/profiles/Driver/utils/view/useDriverInterface'
import type { PublicDriverProfile } from '../../../models/driver.model'

const props = defineProps<{
  card: DriverCard.Card
  profile: PublicDriverProfile
}>()

const radiusMetres = computed(() =>
  Math.max(0, Number(props.profile.coverage?.radius_m || 0))
)
const coverageValue = computed(() => {
  if (radiusMetres.value >= 1_000) {
    const kilometres = radiusMetres.value / 1_000
    return Number.isInteger(kilometres)
      ? String(kilometres)
      : kilometres.toFixed(1)
  }
  return String(radiusMetres.value)
})
const coverageUnit = computed(() => (radiusMetres.value >= 1_000 ? 'km' : 'm'))
const profileStats = computed(() => [
  {
    label: 'Coverage radius',
    value: `${coverageValue.value} ${coverageUnit.value}`,
    icon: 'i-lucide-route',
  },
  {
    label: 'Capabilities',
    value: props.profile.tags.length,
    icon: 'i-lucide-package-check',
  },
])
</script>
