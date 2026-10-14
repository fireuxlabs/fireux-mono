<template>
  <ClientOnly>
    <div
      v-if="place && selectedKitchen && placeOutcome === 'ready' && canWrite"
      class="operating-hours"
    >
      <UAlert
        v-if="!place.timezone || timezoneConflicts.length"
        :title="
          !place.timezone
            ? 'Set the venue timezone'
            : 'Check schedule timezones'
        "
        :description="
          !place.timezone
            ? 'A venue timezone is needed to interpret these hours.'
            : timezoneConflicts.join(' · ')
        "
        color="warning"
      >
        <template #actions>
          <UButton
            to="/workspace/kitchen/identity/profile"
            label="Venue profile"
            color="neutral"
            variant="outline"
          />
        </template>
      </UAlert>
      <div class="operating-hours__schedules">
        <PlaceEditBusinessHours
          :key="placeId"
          title="Venue opening hours"
          :show-timezone="false"
          compact
          :place="place"
          :mutation-authority="mutationAuthority"
        />
        <WorkspaceKitchenOperatingHoursKitchen
          :key="kitchenId"
          :kitchen="selectedKitchen"
          :place="place"
          :can-write="canWrite"
        />
      </div>
      <MoleculesStateCard
        v-if="!['ready', 'empty'].includes(offeringsOutcome)"
        :state="
          offeringsOutcome === 'pending'
            ? 'loading'
            : offeringsOutcome === 'error'
              ? 'error'
              : 'empty'
        "
        :title="
          offeringsOutcome === 'pending'
            ? 'Loading offering schedules'
            : 'Offering schedules unavailable'
        "
      />
      <WorkspaceKitchenOperatingHoursOfferings
        v-else
        :key="`menus:${kitchenId}`"
        :offerings="offerings"
        :menus="menus"
        :menus-outcome="menuOutcome"
      />
    </div>
    <UAlert
      v-else-if="placeOutcome === 'ready'"
      title="Edit access required"
      description="Editing operating hours requires access to this Kitchen."
      color="neutral"
    />
    <MoleculesStateCard
      v-else
      entity="Kitchen operating hours"
      kind="document"
      :loading="placeOutcome === 'pending' || placeOutcome === 'idle'"
      :state="placeOutcome === 'error' ? 'error' : 'missing'"
    />
    <DiagnosticsDebugPanel
      v-bind="debug"
      title="Operating hours debug"
      context="Venue opening → Kitchen working hours → named offering hours"
      class="mt-6 w-full min-w-0"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { defineDevDebugPayload } from 'fireux-core/runtime/types/dev-debug'
import { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
import { useKitchenOfferingCollection } from '../../../composables/useKitchenOfferingCollection'
import { resolveKitchenOperationHours } from '../../../utils/kitchen-readers'
import {
  identityHoursDebug,
  identityKitchenDebug,
  identityPlaceDebug,
  identityOperatingSourcesDebug,
} from '../../../utils/identity-debug'
import PlaceEditBusinessHours from 'fireux-places/runtime/place/components/Edit/BusinessHours.vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useKitchenWorkspacePlace } from '../../../composables/workspace/identity/useKitchenWorkspacePlace'
const {
  place,
  placeId,
  placeOutcome,
  kitchenId,
  canWrite,
  selectedKitchen,
  outcome: kitchenOutcome,
} = useKitchenWorkspacePlace()
const fireux = useFireUXConfig()
const { appId } = fireux
const route = useRoute()
const menuKitchenId = computed(() =>
  place.value &&
  selectedKitchen.value &&
  placeOutcome.value === 'ready' &&
  canWrite.value
    ? kitchenId.value
    : ''
)
const { menus, outcome: menuOutcome } = useKitchenMenuCollection(
  menuKitchenId,
  {
    kitchenCollectionPath: 'kitchens',
  }
)
const kitchenHours = computed(() =>
  resolveKitchenOperationHours(selectedKitchen.value, place.value)
)
const { offerings, outcome: offeringsOutcome } = useKitchenOfferingCollection(
  computed(() => (kitchenOutcome.value === 'ready' ? kitchenId.value : ''))
)
const debug = computed(() =>
  defineDevDebugPayload({
    objectOrigin: 'fetched',
    objects: {
      kitchen: identityKitchenDebug(selectedKitchen.value),
      place: identityPlaceDebug(place.value),
      ...identityOperatingSourcesDebug(
        selectedKitchen.value,
        menus.value,
        offerings.value
      ),
    },
    derived: {
      route: route.path,
      kitchenId: kitchenId.value,
      placeId: placeId.value,
      reads: {
        kitchen: kitchenOutcome.value,
        place: placeOutcome.value,
        menus: menuOutcome.value,
        offerings: offeringsOutcome.value,
      },
      canWrite: canWrite.value,
      venueHoursSource: 'saved Place.business_hours and Place.timezone',
      timezoneConflicts: timezoneConflicts.value,
      effectiveKitchenHours: identityHoursDebug(kitchenHours.value),
      offeringCount: offerings.value.length,
      menuCount: menus.value.length,
    },
  })
)
const timezoneConflicts = computed(() => {
  const venueTimezone = place.value?.timezone
  if (!venueTimezone) return []
  const conflicts: string[] = []
  if (
    kitchenHours.value.windows.length &&
    kitchenHours.value.timezone !== venueTimezone
  )
    conflicts.push(
      `Kitchen uses ${kitchenHours.value.timezone || 'an unset timezone'}; venue uses ${venueTimezone}.`
    )
  for (const service of offerings.value) {
    if (
      service.hours?.windows.length &&
      service.hours.timezone !== venueTimezone
    )
      conflicts.push(
        service.name +
          ' uses ' +
          (service.hours.timezone || 'an unset timezone') +
          '; check its serving hours.'
      )
  }
  return conflicts
})
const mutationAuthority = computed(() => ({
  appId,
  kitchenId: kitchenId.value,
}))
</script>

<style scoped>
.operating-hours {
  display: grid;
  gap: 1.5rem;
  width: 100%;
  min-width: 0;
}
.operating-hours__schedules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 26rem), 1fr));
  align-items: start;
  gap: 1rem;
}
.operating-hours__schedules > * {
  min-width: 0;
}
</style>
