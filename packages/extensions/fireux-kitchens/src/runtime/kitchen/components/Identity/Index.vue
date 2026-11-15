<template>
  <div class="workspace-profile">
    <KitchenIdentityProfile :identity="identity" />
    <KitchenIdentityListing :identity="identity" />
    <div v-if="identity.status.value === 'ready'">
      <UButton
        to="/workspace/kitchen/identity/context"
        label="Kitchen context and shared guidance"
        icon="i-lucide-file-text"
        color="neutral"
        variant="soft"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import KitchenIdentityProfile from './Profile.vue'
import type { KitchenWorkspaceIdentityState } from '../../composables/workspace/useKitchenWorkspaceIdentity'
defineProps<{ identity: KitchenWorkspaceIdentityState }>()
</script>
