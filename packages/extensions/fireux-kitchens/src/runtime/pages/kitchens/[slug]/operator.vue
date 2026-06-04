<template>
  <EntityOperatorBridge
    entity-label="Kitchen"
    :entity-title="kitchenTitle"
    :public-to="publicTo"
    console-to="/console/kitchen"
    :signed-in="Boolean(userId)"
    :has-authority="hasAuthority"
    :missing="!publicKitchen && !pending"
  />
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import EntityOperatorBridge from 'fireux-core/runtime/components/entity/OperatorBridge.vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/useKitchen'
import {
  useKitchenCollection,
  type KitchenCollectionFilter,
} from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'

definePageMeta({
  layout: 'default',
  name: 'KitchenOperatorBridgePage',
})

const route = useRoute()
const { uid } = useAuth()
const routeLocator = computed(() => String(route.params.slug || '').trim())
const userId = computed(() => String(uid.value || '').trim())
const operatorFilter = computed<KitchenCollectionFilter>(() =>
  userId.value ? { operatorId: userId.value } : { ids: [] }
)
const { kitchen: publicKitchen, pending } = useKitchenFetch(routeLocator)
const { kitchens: operatorKitchens } = useKitchenCollection({
  filter: operatorFilter,
})

const kitchenId = computed(() => String(publicKitchen.value?.id || '').trim())
const hasAuthority = computed(() =>
  Boolean(
    kitchenId.value &&
      operatorKitchens.value.some((kitchen) => kitchen.id === kitchenId.value)
  )
)
const kitchenTitle = computed(() =>
  String(publicKitchen.value?.name || routeLocator.value || 'Kitchen').trim()
)
const publicTo = computed(() =>
  routeLocator.value ? `/kitchens/${encodeURIComponent(routeLocator.value)}` : '/kitchens'
)
</script>
