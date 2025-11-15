<!-- packages/extensions/fireux-jobs/src/runtime/pages/employers/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Employers"
      description="Review your employer profile and browse all employers onboarded in this workspace."
    />

    <UPageBody class="space-y-6">
      <!-- Current employer profile -->
      <UCard>
        <template #header><h2>Your Employer Profile</h2></template>

        <template v-if="current">
          <div class="space-y-4">
            <OrganismsProfilesEmployerCardsPill
              :employer="pillProps(current)"
              class="max-w-md"
            />
            <OrganismsProfilesEmployerCardsCell
              :employer="cellProps(current)"
            />
          </div>
        </template>

        <template v-else>
          <UPageCTA title="Create your Employer profile to appear in listings.">
            <template #links>
              <UButton color="primary" :loading="creating" @click="onCreate">
                Create Employer Profile
              </UButton>
            </template>
          </UPageCTA>
        </template>
      </UCard>

      <!-- Employer directory -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2>Employer Directory</h2>
            <UBadge variant="soft">{{ totalEmployers }} total</UBadge>
          </div>
        </template>

        <div
          v-if="directoryPills.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <OrganismsProfilesEmployerCardsPill
            v-for="pill in directoryPills"
            :key="pill.title + (pill.subtitle || '')"
            :employer="pill"
          />
        </div>
        <p v-else class="text-sm opacity-70">
          No employers found in this environment.
        </p>
      </UCard>

      <!-- No raw snapshots here; dev tooling lives under /dev/fireux-jobs -->
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEmployer } from '../../composables/firestore/profiles/Employer/useEmployer.ts'
import { useEmployerComputed } from '../../composables/firestore/profiles/Employer/main/useEmployerComputed.ts'
import { useEmployerInterface } from '../../composables/firestore/profiles/Employer/main/useEmployerInterface.ts'
import { useEmployerCollection } from '../../composables/firestore/profiles/Employer/main/useEmployerCollection.ts'
import { useEmployerCreate } from '../../composables/firestore/profiles/Employer/main/useEmployerCreate.ts'

const { profile } = useEmployer()
const { activeProfile } = useEmployerComputed(profile)
const { pillProps, cellProps } = useEmployerInterface(profile)
const { employers } = useEmployerCollection()
const { createEmployer } = useEmployerCreate()

const current = activeProfile

const roster = computed(() => employers.value ?? [])
const directoryPills = computed(() =>
  roster.value.map((entry) => pillProps(entry))
)
const totalEmployers = computed(() => directoryPills.value.length)

const creating = createEmployer.state

const onCreate = async () => {
  await createEmployer()
}
</script>
