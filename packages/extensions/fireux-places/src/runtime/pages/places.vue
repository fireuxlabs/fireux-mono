<!-- `packages/extensions/fireux-places/src/runtime/pages/places.vue` -->

<template>
  <UPage>
    <UPageHeader
      title="Places"
      description="Search for locations, inspect Google details, and review saved entries."
    />

    <UContainer class="py-10">
      <div class="grid gap-8 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <OrganismsPlacesSearchSection />

        <div class="space-y-6">
          <OrganismsPlacesList />

          <UCard class="shadow-sm" :ui="{ body: 'space-y-3' }">
            <template #header>
              <div
                class="flex items-center gap-2 text-sm font-semibold text-gray-800"
              >
                <UIcon name="i-lucide-lightbulb" /> Quick tips
              </div>
            </template>

            <ul class="list-disc space-y-2 pl-5 text-sm text-gray-600">
              <li>
                Google suggestions appear instantly—confirm to store the place.
              </li>
              <li>
                Saved entries sync from Firestore and enrich future searches.
              </li>
              <li>
                Uploaded avatars land in
                <code>places/&lt;place_id&gt;/avatar</code>.
              </li>
            </ul>
          </UCard>
        </div>
      </div>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts"></script>
