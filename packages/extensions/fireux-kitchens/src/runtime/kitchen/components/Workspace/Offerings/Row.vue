<template>
  <article class="py-4 text-sm" :aria-label="offering.name">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="font-medium">{{ offering.name }}</h3>
      <UBadge
        :color="status === 'On' ? 'success' : 'neutral'"
        variant="subtle"
        >{{ status }}</UBadge
      >
    </div>
    <p class="mt-2 text-muted">{{ menusLabel }}</p>
    <p class="mt-1 whitespace-pre-line text-muted">
      {{ formatWeekdayTimeText(offering.hours) || 'Serving hours needed' }}
    </p>
    <p v-if="option.key === 'collection'" class="mt-1 text-muted">
      {{
        offering.collection_timing === 'next_day'
          ? 'Collection from tomorrow'
          : 'Same-day collection'
      }}
    </p>
    <UButton
      :label="status === 'Off' ? 'Enable & configure' : 'Configure'"
      :aria-label="`${status === 'Off' ? 'Enable and configure' : 'Configure'} ${offering.name} for ${option.label.toLowerCase()}`"
      color="neutral"
      variant="soft"
      trailing-icon="i-lucide-arrow-right"
      class="mt-3"
      :disabled="disabled"
      @click="emit('configure')"
    />
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenOffering } from '../../../models/offering.model'
import {
  offeringOptionStatus,
  type KitchenOfferingOption,
} from '../../../utils/offering-options'
import { formatWeekdayTimeText } from '../../../../utils/weekday-time'
const props = defineProps<{
  offering: KitchenOffering
  option: KitchenOfferingOption
  menusLabel: string
  disabled: boolean
}>()
const emit = defineEmits<{ configure: [] }>()
const status = computed(() =>
  offeringOptionStatus(props.offering, props.option)
)
</script>
