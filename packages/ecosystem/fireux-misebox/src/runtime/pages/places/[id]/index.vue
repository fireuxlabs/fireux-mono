<template>
  <UPage>
    <UPageBody>
      <MiseboxPlaceKitchen
        v-if="place && kitchen"
        :key="kitchen.id"
        :kitchen="kitchen"
        :place="place"
      >
        <template #management>
          <KitchenDetailOperatorPanel
            v-if="canOperateKitchen"
            :kitchen="kitchen"
          />
          <PlaceDetailAdmin v-else :place="place" />
          <!-- Supplier actions remain disconnected until its Place relationship is ready. -->
        </template>
      </MiseboxPlaceKitchen>
      <PlaceDetail v-else-if="place" :place="place">
        <template #services>
          <UAlert
            v-if="kitchens.outcome.value === 'error'"
            title="Kitchen information is unavailable"
            color="error"
            variant="soft"
          >
            <template #actions>
              <UButton
                label="Try again"
                color="neutral"
                variant="soft"
                @click="kitchens.refresh()"
              />
              <FireCopyError
                message="Kitchen information is unavailable"
              />
            </template>
          </UAlert>
          <USkeleton
            v-else-if="kitchens.pending.value"
            class="h-36 rounded-2xl"
            aria-label="Loading Kitchen information"
          />
          <!-- Supplier public content is intentionally disconnected for this pass. -->
        </template>
      </PlaceDetail>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { usePlaceDetail } from 'fireux-places/runtime/place/composables/usePlaceDetail'
import PlaceDetailAdmin from 'fireux-places/runtime/place/components/Detail/Admin.vue'
import KitchenDetailOperatorPanel from 'fireux-kitchens/runtime/kitchen/components/Detail/OperatorPanel.vue'
import { useKitchenCollection } from 'fireux-kitchens/runtime/kitchen/composables/useKitchenCollection'
import { useKitchenAccess } from 'fireux-kitchens/runtime/kitchen/composables/useKitchenAccess'
import MiseboxPlaceKitchen from '../../../components/Place/Kitchen.vue'

definePageMeta({
  layout: 'default',
  title: 'Place',
  description: 'Explore this Place and its Kitchen.',
})
const routeLocator = useRouteParam('id')
const { place, ready } = usePlaceDetail(routeLocator)
await ready
const kitchens = useKitchenCollection({
  placeId: computed(() => place.value?.id),
})
const kitchen = computed(
  () =>
    kitchens.collection.value.find((item) => item.id === place.value?.id) ||
    null
)
const access = useKitchenAccess()
const canOperateKitchen = computed(() =>
  Boolean(
    kitchen.value &&
      access.outcome.value === 'ready' &&
      access.ids.value.includes(kitchen.value.id)
  )
)
await kitchens.ready
</script>
