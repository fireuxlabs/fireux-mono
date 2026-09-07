<template>
  <section class="space-y-6">
    <WorkspaceKitchenIdentityAI :identity="identity" @action="profile?.openAction($event)" />
    <WorkspaceKitchenIdentityProfile ref="profile" :identity="identity" />
    <div class="border-t border-default pt-8">
      <h2 class="text-xl font-semibold tracking-tight">Kitchen setup & appearance</h2>
      <p class="mt-2 mb-6 text-sm text-muted">Publication, venue setup and the look of your workspace.</p>
      <ClientOnly><WorkspaceKitchenIdentitySections /></ClientOnly>
    </div>
    <WorkspaceKitchenResearchSegue capability="Identity" base-path="/workspace/kitchen/identity/search-demand" />
  </section>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { useKitchenIdentity } from '../../../composables/useKitchenIdentity'
import WorkspaceKitchenIdentityProfile from './Profile.vue'
defineProps<{ identity: ReturnType<typeof useKitchenIdentity> }>()
const profile = ref<InstanceType<typeof WorkspaceKitchenIdentityProfile>>()
</script>
