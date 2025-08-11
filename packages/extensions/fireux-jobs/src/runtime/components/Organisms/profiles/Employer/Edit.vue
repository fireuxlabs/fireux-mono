<template>
  <client-only>
    <div class="profile-edit-container">
      <!-- Avatar Upload -->
      <FireMoleculesFormsFirestoreAvatarSelection
        :user="{
          ...props.employer,
          avatar_url: props.employer?.avatarUrl,
        }"
      />

      <!-- Company Name Field (Primary Identifier) -->
      <FireMoleculesFormsFirestoreField
        label="Company Name"
        :firebase-value="props.employer?.company_name"
        placeholder="Enter your company name"
        :update-function="updateCompanyName"
      />

      <!-- Business Type Field -->
      <FireMoleculesFormsFirestoreField
        label="Business Type"
        :firebase-value="props.employer?.business_type"
        placeholder="e.g., Restaurant, Catering, Hotel, Food Manufacturer"
        :update-function="updateBusinessType"
      />

      <!-- Title Field -->
      <FireMoleculesFormsFirestoreField
        label="Your Title"
        :firebase-value="props.employer?.title"
        placeholder="e.g., Owner, HR Manager, Executive Chef"
        :update-function="updateTitle"
      />

      <!-- Bio Short Field -->
      <FireMoleculesFormsFirestoreField
        label="Company Overview"
        :firebase-value="props.employer?.bio_short"
        placeholder="Brief description of your company..."
        type="textarea"
        :rows="3"
        :maxlength="200"
        :update-function="updateBioShort"
      />

      <!-- Bio Long Field -->
      <FireMoleculesFormsFirestoreField
        label="Detailed Company Description"
        :firebase-value="props.employer?.bio_long"
        placeholder="Tell the story of your company in detail..."
        type="textarea"
        :rows="6"
        :maxlength="1000"
        :update-function="updateBioLong"
      />

      <!-- Cuisine Types Array -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Cuisine Types"
        :firebase-value="props.employer?.cuisine_types || []"
        item-placeholder="Cuisine type"
        new-item-placeholder="Add cuisine type (e.g., Italian, French, Asian, etc.)"
        :update-function="updateCuisineTypes"
      />

      <!-- Services Offered Array -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Services Offered"
        :firebase-value="props.employer?.services_offered || []"
        item-placeholder="Service"
        new-item-placeholder="Add service (e.g., Fine Dining, Catering, Events, etc.)"
        :update-function="updateServicesOffered"
      />

      <!-- Benefits Array -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Employee Benefits"
        :firebase-value="props.employer?.benefits || []"
        item-placeholder="Benefit"
        new-item-placeholder="Add benefit (e.g., Health Insurance, Paid Time Off, etc.)"
        :update-function="updateBenefits"
      />

      <!-- Years Established Field -->
      <FireMoleculesFormsFirestoreField
        label="Years Established"
        :firebase-value="props.employer?.years_established"
        placeholder="Enter year company was established"
        type="number"
        :update-function="updateYearsEstablished"
      />

      <!-- Employee Count Field -->
      <FireMoleculesFormsFirestoreField
        label="Employee Count"
        :firebase-value="props.employer?.employee_count"
        placeholder="Number of employees"
        type="number"
        :update-function="updateEmployeeCount"
      />

      <!-- Contact Information -->
      <FireMoleculesFormsFirestoreField
        label="Business Email"
        :firebase-value="props.employer?.email"
        placeholder="business@example.com"
        type="email"
        :update-function="updateEmail"
      />

      <FireMoleculesFormsFirestoreField
        label="Business Phone"
        :firebase-value="props.employer?.phone"
        placeholder="(123) 456-7890"
        type="phone"
        :update-function="updatePhone"
      />

      <FireMoleculesFormsFirestoreField
        label="Company Website"
        :firebase-value="props.employer?.website"
        placeholder="https://yourcompany.com"
        type="url"
        :update-function="updateWebsite"
      />

      <!-- Location Information -->
      <FireMoleculesFormsFirestoreMultiField
        label="Primary Location"
        :firebase-value="props.employer?.location || {}"
        :placeholders="{
          city: 'City',
          state: 'State/Province',
          country: 'Country',
        }"
        :update-function="updateLocation"
        :commas="true"
      />

      <!-- Operating Hours Field -->
      <FireMoleculesFormsFirestoreField
        label="Operating Hours"
        :firebase-value="props.employer?.operating_hours"
        placeholder="e.g., Mon-Fri 9AM-5PM, Weekend hours vary"
        :update-function="updateOperatingHours"
      />

      <!-- Company Size Select -->
      <FireMoleculesFormsFirestoreSelect
        label="Company Size"
        :firebase-value="props.employer?.company_size || 'small'"
        :options="[
          { label: 'Startup (1-10 employees)', value: 'startup' },
          { label: 'Small (11-50 employees)', value: 'small' },
          { label: 'Medium (51-200 employees)', value: 'medium' },
          { label: 'Large (201-1000 employees)', value: 'large' },
          { label: 'Enterprise (1000+ employees)', value: 'enterprise' },
        ]"
        placeholder="Select company size"
        :update-function="updateCompanySize"
      />

      <!-- Hiring Status Select -->
      <FireMoleculesFormsFirestoreSelect
        label="Hiring Status"
        :firebase-value="props.employer?.hiring_status || 'hiring'"
        :options="[
          { label: 'Actively Hiring', value: 'hiring' },
          { label: 'Selective Hiring', value: 'selective' },
          { label: 'Not Hiring', value: 'not_hiring' },
          { label: 'Seasonal Hiring', value: 'seasonal' },
        ]"
        placeholder="Select hiring status"
        :update-function="updateHiringStatus"
      />

      <!-- Social Links -->
      <FireMoleculesFormsFirestoreSocialLinks
        label="Social Media"
        :firebase-value="props.employer?.social_links || {}"
        :update-function="updateSocialLinks"
      />

      <!-- Verified Checkbox -->
      <FireMoleculesFormsFirestoreCheckbox
        label="Profile Verification"
        :firebase-value="props.employer?.verified || false"
        checkbox-label="Mark as verified employer profile"
        :update-function="updateVerified"
      />

      <!-- Active Jobs Count Display (Read-only) -->
      <div class="read-only-field">
        <span class="read-only-label">Active Job Openings</span>
        <div class="value">
          {{ props.employer?.active_jobs?.length || 0 }} open positions
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { useProfileUpdate } from '../../../../core/fireux-core/src/runtime/composables/firestore/profiles/useProfileUpdate'
import { EMPLOYER_CONFIG } from '../../models/profiles/Employer.model'

// Define props
const props = defineProps({
  employer: {
    type: Object,
    required: true,
  },
})

// Get generic profile update functions
const { updateProfile } = useProfileUpdate(EMPLOYER_CONFIG)

// Create field-specific update functions
const updateCompanyName = (value) =>
  updateProfile({ company_name: value }, props.employer.uid)
const updateBusinessType = (value) =>
  updateProfile({ business_type: value }, props.employer.uid)
const updateTitle = (value) =>
  updateProfile({ title: value }, props.employer.uid)
const updateBioShort = (value) =>
  updateProfile({ bio_short: value }, props.employer.uid)
const updateBioLong = (value) =>
  updateProfile({ bio_long: value }, props.employer.uid)
const updateCuisineTypes = (value) =>
  updateProfile({ cuisine_types: value }, props.employer.uid)
const updateServicesOffered = (value) =>
  updateProfile({ services_offered: value }, props.employer.uid)
const updateBenefits = (value) =>
  updateProfile({ benefits: value }, props.employer.uid)
const updateYearsEstablished = (value) =>
  updateProfile({ years_established: parseInt(value) || 0 }, props.employer.uid)
const updateEmployeeCount = (value) =>
  updateProfile({ employee_count: parseInt(value) || 0 }, props.employer.uid)
const updateEmail = (value) =>
  updateProfile({ email: value }, props.employer.uid)
const updatePhone = (value) =>
  updateProfile({ phone: value }, props.employer.uid)
const updateWebsite = (value) =>
  updateProfile({ website: value }, props.employer.uid)
const updateLocation = (value) =>
  updateProfile({ location: value }, props.employer.uid)
const updateOperatingHours = (value) =>
  updateProfile({ operating_hours: value }, props.employer.uid)
const updateCompanySize = (value) =>
  updateProfile({ company_size: value }, props.employer.uid)
const updateHiringStatus = (value) =>
  updateProfile({ hiring_status: value }, props.employer.uid)
const updateSocialLinks = (value) =>
  updateProfile({ social_links: value }, props.employer.uid)
const updateVerified = (value) =>
  updateProfile({ verified: value }, props.employer.uid)
</script>

<style scoped>
.profile-edit-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
  padding: 1rem;
}

.read-only-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.read-only-field .read-only-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.read-only-field .value {
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #6b7280;
  font-style: italic;
}
</style>
