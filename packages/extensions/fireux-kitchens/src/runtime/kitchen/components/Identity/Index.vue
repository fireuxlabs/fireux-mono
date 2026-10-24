<template>
  <div class="grid min-w-0 gap-6">
    <nav aria-label="Identity and brand pages" class="flex flex-wrap gap-2">
      <UButton
        v-for="item in pages"
        :key="item.to"
        :to="item.to"
        :label="item.label"
        :icon="item.icon"
        color="neutral"
        variant="soft"
      />
    </nav>
    <KitchenIdentityListing :identity="identity" />
    <USkeleton
      v-if="
        identity.outcome.value === 'pending' ||
        identity.outcome.value === 'idle'
      "
      class="h-16 rounded-xl"
    />
    <UAlert
      v-else-if="identity.outcome.value === 'empty'"
      title="No Kitchen selected"
      description="Choose a Kitchen to continue."
      icon="i-lucide-utensils"
    />
    <MoleculesStateCard
      v-else-if="
        identity.outcome.value === 'error' ||
        identity.outcome.value === 'missing'
      "
      entity="Kitchen"
      kind="document"
      :state="identity.outcome.value"
      surface="bare"
    />
    <template v-if="identity.status.value === 'ready'">
      <WorkspaceKitchenContext
        :key="`${identity.kitchenId.value}/kitchen`"
        :kitchen-id="identity.kitchenId.value"
        subject="kitchen"
        title="Kitchen context"
        :can-write="identity.canWriteKitchen.value"
      />
      <WorkspaceKitchenContext
        :key="`${identity.kitchenId.value}/venue`"
        :kitchen-id="identity.kitchenId.value"
        subject="venue"
        title="Venue context"
        :can-write="identity.canWrite.value"
      />
    </template>
    <ClientOnly
      ><DiagnosticsDebugPanel v-bind="debug" title="Identity overview debug"
    /></ClientOnly>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from 'fireux-core/runtime/composables/navigation/useNav'
import { defineDevDebugPayload } from 'fireux-core/runtime/types/dev-debug'
import {
  identityKitchenDebug,
  identityPlaceDebug,
} from '../../utils/identity-debug'
import type { useKitchenWorkspaceIdentity } from '../../composables/workspace/useKitchenWorkspaceIdentity'
const props = defineProps<{
  identity: ReturnType<typeof useKitchenWorkspaceIdentity>
}>()
const navigation = useNav(['workspace'])
const pages = computed(
  () =>
    navigation.items.value.find(
      (item) => item.key === 'workspace-kitchen-identity'
    )?.children || []
)
const debug = computed(() =>
  defineDevDebugPayload({
    objectOrigin: 'passed',
    objects: {
      kitchen: identityKitchenDebug(props.identity.selectedKitchen.value),
      place: identityPlaceDebug(props.identity.place.value),
    },
    derived: {
      kitchenId: props.identity.kitchenId.value,
      status: props.identity.status.value,
    },
  })
)
</script>
