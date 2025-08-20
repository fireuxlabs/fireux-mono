<template>
  <div>
    <UCard class="pill">
      <h1 class="pill-title">Misebox Profile Collections</h1>
      <p class="pill-subtitle">Profile data inspection and sync validation</p>
    </UCard>

    <!-- Chefs Collection -->
    <UCard class="cell">
      <h2 class="cell-title">Chefs Collection</h2>
      <UBadge color="chef" variant="outline">
        {{ chefs?.value?.length || 0 }} chefs
      </UBadge>
      <div class="cell-content">
        <FireOrganismsProfileList
          :profiles="chefs?.value || []"
          :filter-composable="useChefFilters"
        >
          <template #profile-item="{ profile }">
            <MiseOrganismsProfilesChefCardsPill :chef="profile" />
          </template>
        </FireOrganismsProfileList>
      </div>
    </UCard>

    <!-- Suppliers Collection -->
    <UCard class="cell">
      <h2 class="cell-title">Suppliers Collection</h2>
      <UBadge color="supplier" variant="outline">
        {{ suppliers?.value?.length || 0 }} suppliers
      </UBadge>
      <div class="cell-content">
        <FireOrganismsProfileList
          :profiles="suppliers?.value || []"
          :filter-composable="useSupplierFilters"
        >
          <template #profile-item="{ profile }">
            <MiseOrganismsProfilesSupplierCardsPill :supplier="profile" />
          </template>
        </FireOrganismsProfileList>
      </div>
    </UCard>

    <!-- Professionals Collection -->
    <UCard class="cell">
      <h2 class="cell-title">Professionals Collection</h2>
      <UBadge color="professional" variant="outline">
        {{ professionals?.value?.length || 0 }} professionals
      </UBadge>
      <div class="cell-content">
        <FireOrganismsProfileList
          :profiles="professionals?.value || []"
          :filter-composable="useProfessionalFilters"
        >
          <template #profile-item="{ profile }">
            <JobProfilesProfessionalCardsPill :professional="profile" />
          </template>
        </FireOrganismsProfileList>
      </div>
    </UCard>

    <!-- Employers Collection -->
    <UCard class="cell">
      <h2 class="cell-title">Employers Collection</h2>
      <UBadge color="employer" variant="outline">
        {{ employers?.value?.length || 0 }} employers
      </UBadge>
      <div class="cell-content">
        <FireOrganismsProfileList
          :profiles="employers?.value || []"
          :filter-composable="useEmployerFilters"
        >
          <template #profile-item="{ profile }">
            <JobProfilesEmployerCardsPill :employer="profile" />
          </template>
        </FireOrganismsProfileList>
      </div>
    </UCard>

    <!-- Copy to Clipboard -->
    <UCard class="cell">
      <h2 class="cell-title">Copy Profile Data</h2>
      <UButton
        @click="copyToClipboard(jsonSnapshot)"
        color="blue"
        variant="outline"
        size="sm"
      >
        Copy JSON
      </UButton>
      <div class="cell-content">
        <p class="text-sm text-gray-600">
          Click to copy all profile data as JSON for comparison with Core Users
        </p>
      </div>
    </UCard>

    <!-- Debug Data -->
    <UCard class="cell">
      <div class="cell-header">
        <h2 class="cell-title">Raw Profile Data</h2>
        <div class="flex items-center gap-2">
          <UBadge color="neutral" variant="outline">Debug</UBadge>
          <UButton
            icon="i-heroicons-clipboard-document"
            size="sm"
            variant="outline"
            @click="copyToClipboard(jsonSnapshot)"
          >
            Copy JSON
          </UButton>
        </div>
      </div>
      <div class="cell-content">
        <pre
          class="text-xs max-h-96 overflow-y-auto bg-gray-100 text-gray-700 p-4 rounded-lg whitespace-pre-wrap"
          >{{ jsonSnapshot }}</pre
        >
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { chefConfig } from '../../models/profiles/Chef.model'
import { supplierConfig } from '../../models/profiles/Supplier.model'
import { professionalConfig } from '#fireux-jobs-models/profiles/Professional.model'
import { employerConfig } from '#fireux-jobs-models/profiles/Employer.model'

// Use the proper useProfile composables
const { collection: chefs } = await useProfile(chefConfig)
const { collection: suppliers } = await useProfile(supplierConfig)
const { collection: professionals } = await useProfile(professionalConfig)
const { collection: employers } = await useProfile(employerConfig)

// JSON snapshot for comparison
const jsonSnapshot = computed(() => {
  return JSON.stringify(
    {
      collections: {
        chefs: {
          total: chefs?.value?.length || 0,
          profiles: chefs?.value || [],
        },
        suppliers: {
          total: suppliers?.value?.length || 0,
          profiles: suppliers?.value || [],
        },
        professionals: {
          total: professionals?.value?.length || 0,
          profiles: professionals?.value || [],
        },
        employers: {
          total: employers?.value?.length || 0,
          profiles: employers?.value || [],
        },
      },
      summary: {
        totalProfiles:
          (chefs?.value?.length || 0) +
          (suppliers?.value?.length || 0) +
          (professionals?.value?.length || 0) +
          (employers?.value?.length || 0),
        chefsCount: chefs?.value?.length || 0,
        suppliersCount: suppliers?.value?.length || 0,
        professionalsCount: professionals?.value?.length || 0,
        employersCount: employers?.value?.length || 0,
      },
    },
    null,
    2
  )
})

// Copy to clipboard function
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('Profile collections JSON copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy Profile JSON:', err)
  }
}

console.log('🍳 Profile Collections Loaded:', {
  chefs: chefs?.value?.length || 0,
  suppliers: suppliers?.value?.length || 0,
  professionals: professionals?.value?.length || 0,
  employers: employers?.value?.length || 0,
})
</script>
