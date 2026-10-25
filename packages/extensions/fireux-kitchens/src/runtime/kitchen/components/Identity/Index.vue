<template>
  <div class="grid min-w-0 gap-6">
    <KitchenIdentityProfile :identity="identity" />
    <KitchenIdentityListing :identity="identity" />
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
  </div>
</template>
<script setup lang="ts">
import KitchenIdentityProfile from './Profile.vue'
import type { KitchenWorkspaceIdentityState } from '../../composables/workspace/useKitchenWorkspaceIdentity'
defineProps<{ identity: KitchenWorkspaceIdentityState }>()
</script>
