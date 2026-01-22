<template>
  <UCard :ui="{ body: 'space-y-3' }">
    <div class="flex items-start gap-3">
      <div class="relative">
        <UAvatar
          :src="resolvedImageUrl || undefined"
          :alt="place.name"
          class="bg-white dark:bg-white"
          size="lg"
          icon="i-lucide-image"
        />
        <div
          v-if="confirming"
          class="absolute inset-0 flex items-center justify-center rounded-full bg-black/10 dark:bg-white/10"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="h-4 w-4 animate-spin text-primary-500"
          />
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <p class="truncate text-sm font-semibold">
          {{ place.name }}
        </p>
        <p class="truncate text-sm text-dimmed">
          {{ place.formatted_address || '—' }}
        </p>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <UBadge
            v-if="isExisting"
            size="xs"
            color="primary"
            variant="soft"
          >
            {{ existingBadgeLabel }}
          </UBadge>
          <UBadge
            v-if="isExisting && !isClaimed"
            size="xs"
            color="amber"
            variant="soft"
          >
            Unclaimed
          </UBadge>
          <UBadge
            v-else-if="isExisting && isClaimed"
            size="xs"
            color="emerald"
            variant="soft"
          >
            Claimed
          </UBadge>
        </div>
        <p v-if="isExisting" class="mt-2 text-xs text-muted">
          {{ existingNote }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <UButton
          v-if="canClaim"
          size="sm"
          color="amber"
          variant="soft"
          :disabled="isBusy"
          @click="emit('claim', place)"
        >
          <UIcon name="i-lucide-flag" class="mr-1 h-4 w-4" /> Claim
        </UButton>
        <UButton
          size="sm"
          color="neutral"
          variant="soft"
          :disabled="isBusy"
          @click="emit('clear')"
        >
          <UIcon name="i-lucide-x" class="mr-1 h-4 w-4" /> Clear
        </UButton>
        <UButton
          size="sm"
          color="primary"
          variant="soft"
          :disabled="isBusy"
          @click="emit('confirm', place)"
        >
          <UIcon
            v-if="!confirming"
            name="i-lucide-check"
            class="mr-2 h-4 w-4"
          />
          <span>{{ confirming ? 'Saving…' : confirmLabel }}</span>
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePlaceLogoState } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlaceLogos';
import type { BasePlace } from '../../../../../models/objects/place.model';

const emit = defineEmits<{
  (e: 'clear'): void
  (e: 'confirm', place: BasePlace): void
  (e: 'claim', place: BasePlace): void
}>()

const props = defineProps<{
  place: BasePlace
  confirming?: boolean
  disabled?: boolean
  claiming?: boolean
  confirmLabel?: string
  existingNote?: string
  targetCollection?: string
}>()

const isBusy = computed(() => !!props.confirming || !!props.claiming || !!props.disabled)

// Prefer a `cell` wrapper when callers provide `place.cell`, otherwise use `place` directly.
const placeRef = computed(() => ((props.place as any)?.cell ?? props.place) as BasePlace)

const isExisting = computed(() => placeRef.value.source !== 'google')
const isClaimed = computed(() => !!(placeRef.value as any).claimed_by)
const canClaim = computed(() => isExisting.value && !isClaimed.value && !isBusy.value)
const sourceCollection = computed(() => (placeRef.value as any)?.collection as string | undefined)
const targetCollection = computed(() => props.targetCollection || sourceCollection.value)

const targetCollectionComputed = computed(() => targetCollection.value || 'record')
const collectionLabel = computed(() => {
  const val = String(targetCollectionComputed.value || 'record')
  if (val.endsWith('ies')) return `${val.slice(0, -3)}y`
  if (val.endsWith('s')) return val.slice(0, -1)
  return val
})

const existingBadgeLabel = computed(() => 'Already in database')

const confirmLabel = computed(() => {
  if (props.confirmLabel) return props.confirmLabel
  if (!isExisting.value) return `Add ${collectionLabel.value} and use in job`
  if (sourceCollection.value && targetCollection.value && sourceCollection.value !== targetCollection.value) {
    return `Add overlay and use ${collectionLabel.value} in job`
  }
  return `Use ${collectionLabel.value} in job`
})

const existingNote = computed(() => {
  if (props.existingNote) return props.existingNote
  if (!isExisting.value) {
    return `Confirm will create the ${collectionLabel.value} and use it for this job.`
  }
  if (sourceCollection.value && targetCollection.value && sourceCollection.value !== targetCollection.value) {
    return `A base record already exists. Confirm will create the overlay and use the ${collectionLabel.value} for this job.`
  }
  return `Confirm will reuse the existing ${collectionLabel.value} — no duplicate will be created.`
})

const { avatar } = usePlaceLogoState(placeRef)

const resolvedImageUrl = computed(() => (placeRef.value as any).place_image || avatar.value || '')
</script>
