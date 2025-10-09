<!-- `packages/extensions/fireux-places/src/runtime/pages/places/index.vue` -->

<template>
  <UPage>
    <UPageHeader
      title="Places"
      description="Search for locations, inspect Google details, and review saved entries."
    />

    <UContainer class="max-w-5xl py-8">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div class="w-full max-w-xl space-y-8">
          <OrganismsPlacesSearchSection />
        </div>

        <div class="w-full max-w-sm space-y-6">
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
