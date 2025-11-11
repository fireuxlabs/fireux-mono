<!-- packages/tenants/fireux-misebox/src/runtime/pages/chefs/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Chefs"
      description="Manage the chef profile attached to this account and browse the roster of all chefs in scope."
    />

    <UPageBody class="space-y-6">
      <!-- Current chef profile -->
      <UCard>
        <template #header><h2>Your Chef Profile</h2></template>

        <template v-if="current">
          <div class="space-y-4">
            <MiseProfilesChefCardsPill
              :chef="pillProps(current)"
              class="max-w-md"
            />
            <OrganismsProfilesChefCardsCell :chef="cellProps(current)" />
          </div>
        </template>

        <template v-else>
          <UPageCTA title="Create your Chef profile to appear in listings.">
            <template #links>
              <UButton color="primary" :loading="creating" @click="onCreate">
                Create Chef Profile
              </UButton>
            </template>
          </UPageCTA>
        </template>
      </UCard>

      <!-- Chef directory -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2>Chef Directory</h2>
            <UBadge variant="soft">{{ totalChefs }} total</UBadge>
          </div>
        </template>

        <div
          v-if="directoryPills.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <MiseProfilesChefCardsPill
            v-for="pill in directoryPills"
            :key="pill.title + (pill.subtitle || '')"
            :chef="pill"
          />
        </div>
        <p v-else class="text-sm opacity-70">
          No chefs found in this environment.
        </p>
      </UCard>

      <!-- Raw snapshots -->
      <UCard>
        <template #header><h2>Raw Snapshots</h2></template>
        <div class="grid gap-4 text-xs md:grid-cols-2">
          <div>
            <h3 class="text-xs font-semibold uppercase opacity-60">
              Core Profile
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{
              profile.coreProfile?.value
            }}</pre>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase opacity-60">
              App Overlay
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{
              profile.appProfile?.value
            }}</pre>
          </div>
          <div class="md:col-span-2">
            <h3 class="text-xs font-semibold uppercase opacity-60">
              Roster (merged)
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{ roster }}</pre>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase opacity-60">
              Global Store
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{ globalChefs }}</pre>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase opacity-60">
              Tenant Overlays
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{ localChefs }}</pre>
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChef } from '../../composables/firestore/profiles/Chef/useChef.ts'

const chef = useChef()
const { profile, pillProps, cellProps, createChef, collection, activeProfile } =
  chef

const current = activeProfile

const roster = computed(() => collection.chefs?.value ?? [])
const directoryPills = computed(() =>
  roster.value.map((entry) => pillProps(entry))
)
const totalChefs = computed(() => directoryPills.value.length)

const globalChefs = computed(() => collection.global?.value ?? [])
const localChefs = computed(() => collection.local?.value ?? [])

const creating = createChef.state

const onCreate = async () => {
  await createChef()
}
</script>
