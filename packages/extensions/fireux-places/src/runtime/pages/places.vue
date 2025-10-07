<!-- `packages/extensions/fireux-places/src/runtime/pages/places.vue` -->

<template>
  <UPage>
    <UPageHeader
      title="Places"
      description="Search for locations, inspect Google details, and review saved entries."
    />

    <UContainer class="py-8 space-y-8">
      <OrganismsPlacesSearchSection />

      <OrganismsPlacesList />
    </UContainer>
  </UPage>
</template>

<script setup lang="ts"></script>
