<!-- FILE: packages/extensions/fireux-places/src/runtime/components/organisms/entities/Place/CTA.vue -->
<template>
  <UPageCTA
    class="fx-cta"
    title="Create a place"
    description="Search a place, confirm it, and store the canonical record for this runtime."
    variant="naked"
  >
    <!-- section consumer -->
    <template #default>
      <div class="fx-cta__body">
        <PlaceSearchSection
          :type="placeType"
          @confirmed="onConfirmed"
        />
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '#imports'
import { computed } from 'vue'
import { normalizePlaceType } from '../../../../composables/fireux/firestore/objects/place/utils/placeCollections'

const route = useRoute()
const router = useRouter()

const placeType = computed<string | null>(() =>
  normalizePlaceType(route.query.type)
)

async function onConfirmed() {
  await router.replace({ query: { ...route.query } })
}
</script>
