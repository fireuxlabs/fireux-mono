<template>
  <EntityOperatorBridge
    entity-label="Property"
    :entity-title="propertyTitle"
    :public-to="publicTo"
    console-to="/console/property"
    :signed-in="Boolean(userId)"
    :has-authority="hasAuthority"
    :missing="!publicProperty && !pending"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EntityOperatorBridge from 'fireux-core/runtime/components/entity/OperatorBridge.vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  usePropertyCollection,
  type PropertyCollectionFilter,
} from '../../../composables/fireux/firestore/property/fetch/usePropertyCollection'

definePageMeta({
  layout: 'default',
  name: 'PropertyOperatorBridgePage',
})

const route = useRoute()
const { uid } = useAuth()
const routeSlug = computed(() => String(route.params.slug || '').trim())
const userId = computed(() => String(uid.value || '').trim())
const operatorFilter = computed<PropertyCollectionFilter>(() =>
  userId.value ? { operatorId: userId.value } : { ids: [] }
)
const { properties: publicProperties, pending } = usePropertyCollection()
const { properties: operatorProperties } = usePropertyCollection({
  filter: operatorFilter,
})

const publicProperty = computed(() => {
  const slug = routeSlug.value.toLowerCase()
  return publicProperties.value.find(
    (property) => String(property.slug || '').trim().toLowerCase() === slug
  ) ?? null
})
const propertyId = computed(() => String(publicProperty.value?.id || '').trim())
const hasAuthority = computed(() =>
  Boolean(propertyId.value && operatorProperties.value.some((property) => property.id === propertyId.value))
)
const propertyTitle = computed(() =>
  String(publicProperty.value?.identity?.name || routeSlug.value || 'Property').trim()
)
const publicTo = computed(() =>
  routeSlug.value ? `/properties/${encodeURIComponent(routeSlug.value)}` : '/properties'
)
</script>
