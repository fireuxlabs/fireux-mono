<!-- packages/extensions/fireux-jobs/src/runtime/pages/professionals/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Professionals"
      description="Maintain your professional profile and view the directory of professionals in this workspace."
    />

    <UPageBody class="space-y-6">
      <!-- Current professional profile -->
      <UCard>
        <template #header><h2>Your Professional Profile</h2></template>

        <template v-if="current">
          <div class="space-y-4">
            <JobProfilesProfessionalCardsPill
              :professional="pillProps(current)"
              class="max-w-md"
            />
            <OrganismsProfilesProfessionalCardsCell
              :professional="cellProps(current)"
            />
          </div>
        </template>

        <template v-else>
          <UPageCTA
            title="Create your Professional profile to appear in listings."
          >
            <template #links>
              <UButton color="primary" :loading="creating" @click="onCreate">
                Create Professional Profile
              </UButton>
            </template>
          </UPageCTA>
        </template>
      </UCard>

      <!-- Professional directory -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2>Professional Directory</h2>
            <UBadge variant="soft">{{ totalProfessionals }} total</UBadge>
          </div>
        </template>

        <div
          v-if="directoryPills.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <JobProfilesProfessionalCardsPill
            v-for="pill in directoryPills"
            :key="pill.title + (pill.subtitle || '')"
            :professional="pill"
          />
        </div>
        <p v-else class="text-sm opacity-70">
          No professionals found in this environment.
        </p>
      </UCard>

      <!-- Snapshot debugging lives in dev routes only -->
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfessional } from '../../composables/firestore/profiles/Professional/useProfessional.ts'
import { useProfessionalComputed } from '../../composables/firestore/profiles/Professional/main/useProfessionalComputed.ts'
import { useProfessionalInterface } from '../../composables/firestore/profiles/Professional/main/useProfessionalInterface.ts'
import { useProfessionalCollection } from '../../composables/firestore/profiles/Professional/main/useProfessionalCollection.ts'
import { useProfessionalCreate } from '../../composables/firestore/profiles/Professional/useProfessionalCreate.ts'

const { profile } = useProfessional()
const { activeProfile } = useProfessionalComputed(profile)
const { pillProps, cellProps } = useProfessionalInterface(profile)
const { professionals } = useProfessionalCollection()
const { createProfessional } = useProfessionalCreate()

const current = activeProfile

const roster = computed(() => professionals.value ?? [])
const directoryPills = computed(() =>
  roster.value.map((entry) => pillProps(entry))
)
const totalProfessionals = computed(() => directoryPills.value.length)

const creating = createProfessional.state

const onCreate = async () => {
  await createProfessional()
}
</script>
