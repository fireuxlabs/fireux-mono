<template>
  <UCard :ui="{ body: 'space-y-3' }">
    <div class="flex items-start gap-3">
      <div class="relative">
        <UAvatar
          :src="resolvedImageUrl || undefined"
          :alt="place.name"
          class="bg-white dark:bg-white"
          size="lg"
          icon="i-lucide-map-pin"
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
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
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
          <span>{{ confirming ? 'Saving…' : 'Confirm' }}</span>
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
}>()

const props = defineProps<{
  place: BasePlace
  confirming?: boolean
  disabled?: boolean
}>()

const isBusy = computed(() => !!props.confirming || !!props.disabled)

const placeRef = computed(() => props.place)
const { avatar } = usePlaceLogoState(placeRef)

const resolvedImageUrl = computed(
  () => props.place.place_image || avatar.value || ''
)
</script>
