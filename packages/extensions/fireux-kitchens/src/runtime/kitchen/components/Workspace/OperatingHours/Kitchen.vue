<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-highlighted">
            Kitchen operating hours
          </h2>
          <p class="mt-1 text-sm text-muted">
            Ordering services follow these hours unless they have their own
            schedule.
          </p>
        </div>
        <UIcon name="i-lucide-chef-hat" class="size-6 text-muted" />
      </div>
    </template>
    <div class="space-y-5">
      <div
        v-if="usesVenueHours && !customRequested"
        class="flex flex-wrap items-center justify-between gap-4"
      >
        <div class="space-y-1">
          <p class="font-medium text-highlighted">Same as venue</p>
          <p class="text-sm text-muted">
            {{
              effectiveHours.windows.length
                ? 'Changes to venue hours apply here automatically.'
                : 'Add venue opening hours to set your Kitchen’s schedule.'
            }}
          </p>
        </div>
        <UButton
          label="Set different hours"
          color="neutral"
          variant="outline"
          :disabled="!canWrite || saving"
          @click="customRequested = true"
        />
      </div>
      <template v-else>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-muted">
            {{
              customRequested && usesVenueHours
                ? 'Start with venue hours and adjust the days that differ. Nothing changes until you save.'
                : 'Your Kitchen uses its own weekly schedule.'
            }}
          </p>
          <UButton
            v-if="customRequested && usesVenueHours"
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="customRequested = false"
          />
          <UButton
            v-else
            label="Use venue hours"
            color="neutral"
            variant="outline"
            :loading="saving"
            :disabled="!canWrite"
            @click="useVenueHours"
          />
        </div>
        <PlaceOpeningHoursSchedule
          :hours="effectiveHours"
          compact
          :timezone="effectiveHours.timezone"
          :update="updateHours"
          :disabled="!canWrite || saving"
        />
      </template>
      <PlaceOpeningHoursWeek
        v-if="
          usesVenueHours && !customRequested && effectiveHours.windows.length
        "
        :hours="effectiveHours"
        compact
      />
      <UAlert
        v-if="error"
        title="Could not update Kitchen hours"
        :description="error"
        color="error"
      >
        <template #actions><MoleculesCopyError :message="error" /></template>
      </UAlert>
      <footer
        class="flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4 text-sm text-muted"
      >
        <UButton
          to="/workspace/kitchen/orders/ordering"
          label="Ordering services"
          trailing-icon="i-lucide-arrow-up-right"
          color="neutral"
          variant="link"
        />
      </footer>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PlaceOpeningHoursSchedule from 'fireux-places/runtime/place/components/OpeningHours/Schedule.vue'
import PlaceOpeningHoursWeek from 'fireux-places/runtime/place/components/OpeningHours/Week.vue'
import type {
  Place,
  PlaceBusinessHours,
} from 'fireux-places/runtime/place/models/place.model'
import type { Kitchen } from '../../../models/kitchen.model'
import { useKitchenOperationHours } from '../../../composables/workspace/ordering/useKitchenOperationHours'
import { resolveKitchenOperationHours } from '../../../utils/kitchen-readers'

const props = defineProps<{
  kitchen: Kitchen
  place: Place
  canWrite: boolean
}>()
const { updateHours: saveHours } = useKitchenOperationHours()
const customRequested = ref(false)
const saving = ref(false)
const error = ref('')
const effectiveHours = computed(() =>
  resolveKitchenOperationHours(props.kitchen, props.place)
)
const usesVenueHours = computed(() => effectiveHours.value.source === 'place')
watch(
  () => props.kitchen.id,
  () => {
    customRequested.value = false
    error.value = ''
  }
)
async function updateHours(hours: PlaceBusinessHours) {
  if (!props.canWrite) throw new Error('This Kitchen is read-only.')
  if (!effectiveHours.value.timezone)
    throw new Error('Set the venue timezone before saving Kitchen hours.')
  if (!hours.windows.length)
    throw new Error('Keep at least one opening time, or use venue hours.')
  await saveHours(props.kitchen.id, {
    source: 'custom',
    timezone: effectiveHours.value.timezone,
    windows: hours.windows,
  })
}
async function useVenueHours() {
  if (!props.canWrite || saving.value) return
  saving.value = true
  error.value = ''
  try {
    await saveHours(props.kitchen.id, null)
    customRequested.value = false
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Please try again.'
  } finally {
    saving.value = false
  }
}
</script>
