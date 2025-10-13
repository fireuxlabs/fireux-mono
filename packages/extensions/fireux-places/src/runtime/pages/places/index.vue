<!-- packages/extensions/fireux-places/src/runtime/pages/places/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Places"
      description="Search for locations, inspect Google details, and review saved entries."
    />

    <UContainer class="max-w-5xl py-8">
      <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
        <!-- Search Section -->
        <section
          class="w-full max-w-xl space-y-8"
          aria-labelledby="places-search-heading"
        >
          <h2 id="places-search-heading" class="sr-only">Search places</h2>
          <OrganismsPlacesSearchSection />
        </section>

        <!-- Sidebar: Saved List + Tips -->
        <aside
          class="w-full max-w-sm space-y-6"
          aria-labelledby="places-saved-heading"
        >
          <h2 id="places-saved-heading" class="sr-only">Saved places</h2>

          <ClientOnly>
            <Suspense>
              <template #default>
                <OrganismsPlacesList />
              </template>
              <template #fallback>
                <UCard class="shadow-sm">
                  <template #header>
                    <div class="flex items-center justify-between">
                      <div
                        class="flex items-center gap-2 text-sm font-semibold text-gray-800"
                      >
                        <UIcon name="i-lucide-bookmark" /> Saved places
                      </div>
                      <USkeleton class="h-5 w-8 rounded" />
                    </div>
                  </template>
                  <div class="space-y-2">
                    <USkeleton class="h-12 w-full rounded-md" />
                    <USkeleton class="h-12 w-full rounded-md" />
                    <USkeleton class="h-12 w-full rounded-md" />
                  </div>
                </UCard>
              </template>
            </Suspense>
          </ClientOnly>

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
                Google suggestions appear instantly - confirm to store the
                place.
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
        </aside>
      </div>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts"></script>
