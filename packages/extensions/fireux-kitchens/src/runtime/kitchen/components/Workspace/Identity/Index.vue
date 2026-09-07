<template>
<div class="workspace-profile workspace-surface">
          <WorkspaceKitchenIdentityAI
            :identity="identity"
            @action="profile?.openAction($event)"
          />
          <WorkspaceKitchenIdentityProfile ref="profile" :identity="identity" />
          <div class="workspace-profile__section">
            <ClientOnly>
              <WorkspaceKitchenIdentitySections />
            </ClientOnly>
          </div>
          <WorkspaceKitchenResearchSegue
            capability="Identity"
            base-path="/workspace/kitchen/identity/search-demand"
          />
        </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { useKitchenIdentity } from '../../../composables/useKitchenIdentity'
import WorkspaceKitchenIdentityProfile from './Profile.vue'
defineProps<{ identity: ReturnType<typeof useKitchenIdentity> }>()
const profile = ref<InstanceType<typeof WorkspaceKitchenIdentityProfile>>()
</script>
