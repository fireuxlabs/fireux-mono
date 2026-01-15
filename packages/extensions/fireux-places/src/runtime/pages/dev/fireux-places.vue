<template>
  <UPage>
    <UPageHeader
      title="Dev · Places (Ext)"
      description="Collection-first view; filter by missing or extra fields (against the runtime Place model)."
    />

    <UPageBody class="space-y-10">
      <OrganismsObjectsPlaceCollectionManager v-slot="{ places }">
        <DevPlacesDriftPanels :places="places" />
      </OrganismsObjectsPlaceCollectionManager>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
// This dev page intentionally uses the same collection manager as /places
// so we have one aligned source of truth for collection + card mapping.

definePageMeta({
  layout: 'dev',
  alias: ['/dev/fireux-places'],
  nav: {
    key: 'dev-ext-places',
    label: 'Places (Ext)',
    icon: 'i-lucide-map-pin',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})
</script>
