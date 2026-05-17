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
import { computed } from 'vue'
import EntityOperatorBridge from 'fireux-core/runtime/components/entity/OperatorBridge.vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
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
const routeSlug = computed(() => String(route.params.slug || '').trim())
const userId = computed(() => String(uid.value || '').trim())
const operatorFilter = computed<KitchenCollectionFilter>(() =>
  userId.value ? { operatorId: userId.value } : { ids: [] }
)
const { kitchens: publicKitchens, pending } = useKitchenCollection()
const { kitchens: operatorKitchens } = useKitchenCollection({
  filter: operatorFilter,
})

const publicKitchen = computed(() => {
  const slug = routeSlug.value.toLowerCase()
  return publicKitchens.value.find(
    (kitchen) => String(kitchen.slug || '').trim().toLowerCase() === slug
  ) ?? null
})
const kitchenId = computed(() => String(publicKitchen.value?.id || '').trim())
const hasAuthority = computed(() =>
  Boolean(kitchenId.value && operatorKitchens.value.some((kitchen) => kitchen.id === kitchenId.value))
)
const kitchenTitle = computed(() =>
  String(publicKitchen.value?.name || routeSlug.value || 'Kitchen').trim()
)
const publicTo = computed(() =>
  routeSlug.value ? `/kitchens/${encodeURIComponent(routeSlug.value)}` : '/kitchens'
)
</script>
