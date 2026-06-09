<template>
  <EntityOperatorBridge
    entity-label="Kitchen"
    :entity-title="kitchenTitle"
    :public-to="publicTo"
    console-to="/console/kitchen"
    :signed-in="Boolean(userId)"
    :has-authority="hasAuthority"
    :missing="!publicKitchen && !bridgePending"
  />
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import EntityOperatorBridge from 'fireux-core/runtime/components/entity/OperatorBridge.vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAuthority'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/useKitchen'
import { resolveKitchenConsoleCollectionPath } from '../../../composables/fireux/console/kitchen/operations/collections/useKitchenChildCollection'

definePageMeta({
  layout: 'default',
  name: 'KitchenOperatorBridgePage',
})

const route = useRoute()
const { uid } = useAuth()
const { appId } = useFireUXConfig()
const routeLocator = computed(() => String(route.params.slug || '').trim())
const userId = computed(() => String(uid.value || '').trim())
const currentAppId = computed(() => String(appId || '').trim())
const { kitchen: publicKitchen, pending } = useKitchenFetch(routeLocator)
const kitchenId = computed(() => String(publicKitchen.value?.id || '').trim())
const operatorCollectionPath = computed(() =>
  currentAppId.value ? resolveKitchenConsoleCollectionPath(currentAppId.value) : ''
)
const { kitchen: operatorKitchen, pending: operatorPending } = useKitchenFetch(kitchenId, {
  collectionPath: operatorCollectionPath,
  hydrate: false,
})
const hasAuthority = computed(() =>
  targetHasOperator(operatorKitchen.value, userId.value)
)
const kitchenTitle = computed(() =>
  String(publicKitchen.value?.name || routeLocator.value || 'Kitchen').trim()
)
const publicTo = computed(() =>
  routeLocator.value ? `/kitchens/${encodeURIComponent(routeLocator.value)}` : '/kitchens'
)
const bridgePending = computed(() => pending.value || operatorPending.value)
</script>
