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
            to="/workspace/kitchen/identity/place"
            label="Venue settings"
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
      <WorkspaceKitchenOperatingHoursMenus
        :key="`menus:${kitchenId}`"
        :panels="panels"
        :outcome="menuOutcome"
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
    <DevDebugPanel
      v-bind="debug"
      title="Operating hours debug"
      context="Saved venue → Kitchen → published Menus → linked services"
      class="mt-6 w-full min-w-0"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { defineDevDebugPayload } from 'fireux-core/runtime/types/dev-debug'
import { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
import { readKitchenOrdering } from '../../../utils/kitchen-ordering'
import { resolveKitchenOperationHours } from '../../../utils/kitchen-readers'
import { menuServiceSummaries } from '../../../utils/menu-service-summary'
import {
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../utils/kitchen-menu-route'
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
const { publishedMenus, outcome: menuOutcome } = useKitchenMenuCollection(
  menuKitchenId,
  {
    kitchenCollectionPath: 'kitchens',
  }
)
const kitchenHours = computed(() =>
  resolveKitchenOperationHours(selectedKitchen.value, place.value)
)
const panels = computed(() => {
  const kitchen = selectedKitchen.value as
    | (Record<string, unknown> & { slug?: string })
    | null
  if (!kitchen || !menuKitchenId.value || menuOutcome.value !== 'ready')
    return []
  return publishedMenus.value.map((menu) => ({
    menu,
    entries: menuServiceSummaries({
      menu,
      services: readKitchenOrdering(kitchen.ordering).services,
      kitchenHours: kitchenHours.value,
      scope: fireux.isTenant
        ? tenantMenuRouteScope()
        : directoryMenuRouteScope(kitchen.slug),
      origin: '',
    }),
  }))
})
const debug = computed(() =>
  defineDevDebugPayload({
    objectOrigin: 'fetched',
    objects: {
      kitchen: identityKitchenDebug(selectedKitchen.value),
      place: identityPlaceDebug(place.value),
      ...identityOperatingSourcesDebug(
        selectedKitchen.value,
        publishedMenus.value
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
      },
      canWrite: canWrite.value,
      venueHoursSource: 'saved Place.business_hours and Place.timezone',
      timezoneConflicts: timezoneConflicts.value,
      effectiveKitchenHours: identityHoursDebug(kitchenHours.value),
      menuCount: panels.value.length,
      omittedMenus: Math.max(0, panels.value.length - 100),
      menus: panels.value.slice(0, 100).map(({ menu, entries }) => ({
        id: menu.id,
        slug: menu.slug,
        services: entries.map((entry) => ({
          type: entry.type,
          state: entry.state,
          hoursSource: entry.hoursSource,
          sharedMenuCount: entry.sharedMenuCount,
          configurePath: entry.configurePath,
          hours: identityHoursDebug(entry.hours),
          diagnostic: entry.diagnostic,
        })),
      })),
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
  for (const { menu, entries } of panels.value) {
    for (const entry of entries) {
      if (entry.hours?.windows.length && entry.hours.timezone !== venueTimezone)
        conflicts.push(
          `${menu.name} / ${entry.label} uses ${entry.hours.timezone || 'an unset timezone'}; check its service settings.`
        )
    }
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
