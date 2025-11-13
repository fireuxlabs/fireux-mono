<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <h2>{{ headerTitle }}</h2>
        <p>{{ headerDescription }}</p>
      </template>

      <template v-if="current">
        <div class="space-y-4">
          <JobProfilesProfessionalCardsPill
            v-if="pill"
            :professional="pill"
            class="max-w-md"
          />
          <OrganismsProfilesProfessionalCardsCell
            v-if="cell"
            :professional="cell"
          />
        </div>
      </template>

      <p v-else class="text-sm opacity-70">No professional profile loaded.</p>
    </UCard>

    <JobProfilesProfessionalCardsProfile
      v-if="profileCard"
      :professional="profileCard"
    />
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{ professional?: ProfessionalProfile | null }>()

const { profile } = useProfessional()
const { activeProfile } = useProfessionalComputed(profile)
const { pillProps, cellProps, profileProps } = useProfessionalInterface(profile)

const current = computed<ProfessionalProfile | null>(
  () => props.professional ?? activeProfile.value ?? null
)

const headerTitle = computed(
  () => current.value?.title ?? current.value?.display_name ?? 'Professional'
)
const headerDescription = computed(
  () => current.value?.subtitle ?? 'Professional details'
)

const pill = computed(() => (current.value ? pillProps(current.value) : null))
const cell = computed(() => (current.value ? cellProps(current.value) : null))
const profileCard = computed(() =>
  current.value ? profileProps(current.value) : null
)
</script>
