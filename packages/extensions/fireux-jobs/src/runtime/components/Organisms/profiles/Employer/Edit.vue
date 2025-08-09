<template>
  <client-only>
    <div class="edit-component">
      <!-- Company Information -->
      <FireMoleculesFormsFirestoreField
        label="Company Name"
        :firebase-value="props.employer?.company_name || ''"
        placeholder="Enter company name"
        :update-function="updateCompanyName"
      />

      <FireMoleculesFormsFirestoreField
        label="Email"
        :firebase-value="props.employer?.email || ''"
        placeholder="Enter business email"
        type="email"
        :update-function="updateEmail"
      />

      <FireMoleculesFormsFirestoreField
        label="Title"
        :firebase-value="props.employer?.title || ''"
        placeholder="Enter your role/title"
        :update-function="updateTitle"
      />

      <FireMoleculesFormsFirestoreField
        label="Website"
        :firebase-value="props.employer?.website || ''"
        placeholder="Enter company website"
        type="url"
        :update-function="updateWebsite"
      />

      <!-- Business Details -->
      <FireMoleculesFormsFirestoreSelect
        label="Business Type"
        :firebase-value="props.employer?.business_type || ''"
        :options="[
          { label: 'Restaurant', value: 'restaurant' },
          { label: 'Hotel', value: 'hotel' },
          { label: 'Catering', value: 'catering' },
          { label: 'Food Service', value: 'food_service' },
          { label: 'Retail', value: 'retail' },
          { label: 'Other', value: 'other' },
        ]"
        placeholder="Select business type"
        :update-function="updateBusinessType"
      />

      <FireMoleculesFormsFirestoreField
        label="Short Bio"
        :firebase-value="props.employer?.bio_short || ''"
        placeholder="Brief company description"
        type="textarea"
        :rows="3"
        :update-function="updateBioShort"
      />

      <FireMoleculesFormsFirestoreField
        label="Detailed Bio"
        :firebase-value="props.employer?.bio_long || ''"
        placeholder="Detailed company description"
        type="textarea"
        :rows="6"
        :update-function="updateBioLong"
      />

      <!-- Business Stats -->
      <FireMoleculesFormsFirestoreField
        label="Employee Count"
        :firebase-value="props.employer?.employee_count?.toString() || ''"
        placeholder="Number of employees"
        type="number"
        :update-function="(value) => updateEmployeeCount(parseInt(value) || 0)"
      />

      <FireMoleculesFormsFirestoreField
        label="Years Established"
        :firebase-value="props.employer?.years_established?.toString() || ''"
        placeholder="Years in business"
        type="number"
        :update-function="
          (value) => updateYearsEstablished(parseInt(value) || 0)
        "
      />

      <FireMoleculesFormsFirestoreField
        label="Covers Per Service"
        :firebase-value="props.employer?.covers_per_service?.toString() || ''"
        placeholder="Average covers per service"
        type="number"
        :update-function="
          (value) => updateCoversPerService(parseInt(value) || 0)
        "
      />

      <FireMoleculesFormsFirestoreSelect
        label="Annual Revenue"
        :firebase-value="props.employer?.annual_revenue || ''"
        :options="[
          { label: 'Under CHF 100K', value: 'under_100k' },
          { label: 'CHF 100K - 500K', value: '100k_500k' },
          { label: 'CHF 500K - 1M', value: '500k_1m' },
          { label: 'CHF 1M - 5M', value: '1m_5m' },
          { label: 'CHF 5M+', value: '5m_plus' },
          { label: 'Prefer not to say', value: 'private' },
        ]"
        placeholder="Select revenue range"
        :update-function="updateAnnualRevenue"
      />

      <!-- Business Categories -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Specialties"
        :firebase-value="props.employer?.specialties || []"
        item-placeholder="Specialty"
        new-item-placeholder="Add business specialty"
        :update-function="updateSpecialties"
      />

      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Cuisine Types"
        :firebase-value="props.employer?.cuisine_types || []"
        item-placeholder="Cuisine type"
        new-item-placeholder="Add cuisine type"
        :update-function="updateCuisineTypes"
      />

      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Establishment Types"
        :firebase-value="props.employer?.establishment_type || []"
        item-placeholder="Establishment type"
        new-item-placeholder="Add establishment type"
        :update-function="updateEstablishmentType"
      />

      <!-- Legal Information -->
      <FireMoleculesFormsFirestoreField
        label="Business License"
        :firebase-value="props.employer?.business_license || ''"
        placeholder="Business license number"
        :update-function="updateBusinessLicense"
      />

      <FireMoleculesFormsFirestoreField
        label="Tax ID"
        :firebase-value="props.employer?.tax_id || ''"
        placeholder="Tax identification number"
        :update-function="updateTaxId"
      />

      <!-- Verification Status -->
      <FireMoleculesFormsFirestoreCheckbox
        label="Verified Status"
        :firebase-value="props.employer?.verified || false"
        checkbox-label="Company is verified"
        :update-function="updateVerified"
      />
    </div>
  </client-only>
</template>

<script setup>
// Define props
const props = defineProps({
  employer: {
    type: Object,
    required: false, // ✅ FIXED: Change to false to handle undefined gracefully
    default: () => null,
  },
})

// Get update functions
const {
  updateCompanyName,
  updateEmail,
  updateTitle,
  updateWebsite,
  updateBusinessType,
  updateBioShort,
  updateBioLong,
  updateEmployeeCount,
  updateYearsEstablished,
  updateCoversPerService,
  updateAnnualRevenue,
  updateSpecialties,
  updateCuisineTypes,
  updateEstablishmentType,
  updateBusinessLicense,
  updateTaxId,
  updateVerified,
} = useEmployerUpdate()
</script>

<style scoped>
.edit-component {
  width: 100%;
  margin: 0;
  padding: 0;
  max-width: none;
}
</style>
