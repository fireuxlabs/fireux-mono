<template>
  <div class="form-stack">
    <div>
      <p class="text-sm font-semibold text-primary">Kitchen setup</p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight text-highlighted">
        Choose a Place
      </h1>
      <p class="mt-2 text-sm leading-6 text-muted">
        Select the Place this Kitchen operates from.
      </p>
    </div>

    <MoleculesStateCard
      v-if="pending"
      entity="place"
      kind="collection"
      surface="bare"
      loading
    />

    <UAlert
      v-else-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Unable to load Places"
      :description="error"
    />

    <div v-else-if="options.length" class="grid gap-3 sm:grid-cols-2">
      <UPageCard
        v-for="option in options"
        :key="option.place.id"
        :title="option.place.name"
        :description="option.place.short_address || 'Address not added'"
        :icon="option.existing_kitchen ? 'i-lucide-cooking-pot' : 'i-lucide-map-pin'"
        variant="subtle"
        class="cursor-pointer"
        @click="emit('select', option.place.id)"
      >
        <template #footer>
          <div class="flex items-center justify-between gap-3">
            <UBadge
              v-if="option.existing_kitchen"
              color="neutral"
              variant="soft"
            >
              Kitchen exists
            </UBadge>
            <span v-else class="text-xs text-muted">Available</span>
            <UButton
              type="button"
              color="primary"
              variant="soft"
              size="sm"
              icon="i-lucide-arrow-right"
              @click.stop="emit('select', option.place.id)"
            >
              Choose
            </UButton>
          </div>
        </template>
      </UPageCard>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-map-pin"
      title="No available Places"
      description="Add a Place first, then return here to create its Kitchen."
    />

    <div class="flex flex-wrap items-center gap-3 border-t border-default pt-4">
      <span class="text-sm text-muted">Can’t see the Place you need?</span>
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        icon="i-lucide-map-pin-plus"
        @click="emit('add')"
      >
        Add a Place
      </UButton>
      <UButton
        v-if="error"
        type="button"
        color="neutral"
        variant="ghost"
        icon="i-lucide-refresh-cw"
        @click="emit('refresh')"
      >
        Try again
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KitchenOnboardingPlaceOption } from '../../../models/kitchen-onboarding.model'

defineProps<{
  options: KitchenOnboardingPlaceOption[]
  pending: boolean
  error: string
}>()

const emit = defineEmits<{
  (event: 'add'): void
  (event: 'refresh'): void
  (event: 'select', placeId: string): void
}>()
</script>
