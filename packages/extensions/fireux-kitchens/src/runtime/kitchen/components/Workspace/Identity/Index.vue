<template>
  <section class="space-y-6">
    <template v-if="view === 'hours'">
      <UPageHeader
        title="Opening hours"
        description="Manage the venue’s opening hours and local details."
      />
      <ClientOnly>
        <PlaceEditBusinessHours v-if="identity.place.value && identity.canWrite.value" :place="identity.place.value" :mutation-authority="identity.mutationAuthority.value" />
        <UAlert v-else title="Opening hours unavailable" description="Wait for this kitchen’s venue to load. Editing requires access to the selected kitchen." color="neutral" variant="subtle" />
      </ClientOnly>
    </template>
    <template v-else-if="view === 'public'">
      <UPageHeader
        title="Public information"
        description="Review publication and the information guests see."
      />
      <ClientOnly><WorkspaceKitchenIdentitySections /></ClientOnly>
    </template>
    <WorkspaceKitchenIdentityProfile v-else :identity="identity" />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import PlaceEditBusinessHours from 'fireux-places/runtime/place/components/Edit/BusinessHours.vue'
import { useRoute } from '#imports'
import type { useKitchenIdentity } from '../../../composables/workspace/identity/useKitchenIdentity'
import WorkspaceKitchenIdentityProfile from './Profile.vue'
defineProps<{ identity: ReturnType<typeof useKitchenIdentity> }>()
const route = useRoute()
const view = computed(() => String(route.query.view || 'details'))
</script>
