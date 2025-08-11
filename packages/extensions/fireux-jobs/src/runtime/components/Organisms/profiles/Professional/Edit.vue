<template>
  <client-only>
    <div class="profile-edit-container">
      <!-- Avatar Upload -->
      <FireMoleculesFormsFirestoreAvatarSelection
        :user="{
          ...props.professional,
          avatar_url: props.professional?.avatarUrl,
        }"
      />

      <!-- Professional Name Field (Primary Identifier) -->
      <FireMoleculesFormsFirestoreField
        label="Professional Name"
        :firebase-value="props.professional?.professional_name"
        placeholder="Enter your professional name"
        :update-function="updateProfessionalName"
      />

      <!-- Title Field -->
      <FireMoleculesFormsFirestoreField
        label="Professional Title"
        :firebase-value="props.professional?.title"
        placeholder="e.g., Executive Chef, Sous Chef, Line Cook, Pastry Chef"
        :update-function="updateTitle"
      />

      <!-- Years of Experience Field -->
      <FireMoleculesFormsFirestoreField
        label="Years of Experience"
        :firebase-value="props.professional?.years_experience"
        placeholder="e.g., 5"
        type="number"
        :min="0"
        :max="50"
        :update-function="updateYearsExperience"
      />

      <!-- Bio Short Field -->
      <FireMoleculesFormsFirestoreField
        label="Professional Summary"
        :firebase-value="props.professional?.bio_short"
        placeholder="Brief description of your professional background..."
        type="textarea"
        :rows="3"
        :maxlength="200"
        :update-function="updateBioShort"
      />

      <!-- Bio Long Field -->
      <FireMoleculesFormsFirestoreField
        label="Detailed Professional Biography"
        :firebase-value="props.professional?.bio_long"
        placeholder="Detailed description of your culinary journey, experience, and specialties..."
        type="textarea"
        :rows="6"
        :maxlength="1000"
        :update-function="updateBioLong"
      />

      <!-- Hourly Rate Field -->
      <FireMoleculesFormsFirestoreField
        label="Hourly Rate (CHF)"
        :firebase-value="props.professional?.hourly_rate"
        placeholder="e.g., 45"
        type="number"
        :min="0"
        :max="200"
        :step="0.01"
        :update-function="updateHourlyRate"
      />

      <!-- Specialties Field -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Culinary Specialties"
        :firebase-value="props.professional?.specialties"
        placeholder="e.g., French Cuisine, Pastry, Molecular Gastronomy"
        :update-function="updateSpecialties"
      />

      <!-- Cuisines Field -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Cuisine Types"
        :firebase-value="props.professional?.cuisines"
        placeholder="e.g., Italian, Asian, Mediterranean"
        :update-function="updateCuisines"
      />

      <!-- Skills Field -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Professional Skills"
        :firebase-value="props.professional?.skills"
        placeholder="e.g., Menu Development, Food Safety, Team Leadership"
        :update-function="updateSkills"
      />

      <!-- Certifications Field -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Certifications"
        :firebase-value="props.professional?.certifications"
        placeholder="e.g., ServSafe, HACCP, Culinary Arts Degree"
        :update-function="updateCertifications"
      />

      <!-- Languages Field -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Languages"
        :firebase-value="props.professional?.languages"
        placeholder="e.g., English, German, French"
        :update-function="updateLanguages"
      />

      <!-- Location Field -->
      <FireMoleculesFormsFirestoreField
        label="Location"
        :firebase-value="props.professional?.location"
        placeholder="e.g., Zurich, Switzerland"
        :update-function="updateLocation"
      />

      <!-- Availability Status -->
      <FireMoleculesFormsFirestoreSelect
        label="Availability Status"
        :firebase-value="props.professional?.availability_status"
        :options="[
          { value: 'available', label: 'Available' },
          { value: 'busy', label: 'Busy' },
          { value: 'unavailable', label: 'Unavailable' },
        ]"
        :update-function="updateAvailabilityStatus"
      />

      <!-- Available for Travel -->
      <FireMoleculesFormsFirestoreCheckbox
        label="Available for Travel"
        :firebase-value="props.professional?.available_for_travel"
        :update-function="updateAvailableForTravel"
      />

      <!-- Remote Work -->
      <FireMoleculesFormsFirestoreCheckbox
        label="Available for Remote Work"
        :firebase-value="props.professional?.remote_work"
        :update-function="updateRemoteWork"
      />

      <!-- Education Field -->
      <FireMoleculesFormsFirestoreField
        label="Education"
        :firebase-value="props.professional?.education"
        placeholder="e.g., Culinary Institute of America, Le Cordon Bleu"
        :update-function="updateEducation"
      />

      <!-- Work Authorization -->
      <FireMoleculesFormsFirestoreSelect
        label="Work Authorization"
        :firebase-value="props.professional?.work_authorization"
        :options="[
          { value: 'citizen', label: 'Swiss Citizen' },
          { value: 'permanent_resident', label: 'Permanent Resident' },
          { value: 'work_permit', label: 'Work Permit' },
          { value: 'eu_citizen', label: 'EU Citizen' },
          { value: 'other', label: 'Other' },
        ]"
        :update-function="updateWorkAuthorization"
      />

      <!-- Social Links -->
      <FireMoleculesFormsFirestoreSocialLinks
        :firebase-value="props.professional?.social_links"
        :update-function="updateSocialLinks"
      />

      <!-- Awards and Recognition -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Awards & Recognition"
        :firebase-value="props.professional?.awards"
        placeholder="e.g., James Beard Award, Michelin Star, Best Young Chef"
        :update-function="updateAwards"
      />

      <!-- Preferred Job Types -->
      <FireMoleculesFormsFirestoreMultiField
        label="Preferred Job Types"
        :firebase-value="props.professional?.preferred_job_types"
        :options="[
          'Full-time',
          'Part-time',
          'Contract',
          'Temporary',
          'Freelance',
          'Event-based',
        ]"
        :update-function="updatePreferredJobTypes"
      />

      <!-- Dietary Specializations -->
      <FireMoleculesFormsFirestoreMultiField
        label="Dietary Specializations"
        :firebase-value="props.professional?.dietary_specializations"
        :options="[
          'Vegan',
          'Vegetarian',
          'Gluten-free',
          'Kosher',
          'Halal',
          'Keto',
          'Paleo',
          'Raw food',
        ]"
        :update-function="updateDietarySpecializations"
      />

      <!-- Equipment Proficiency -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Equipment Proficiency"
        :firebase-value="props.professional?.equipment_proficiency"
        placeholder="e.g., Combi Oven, Sous Vide, Wood-fired Oven"
        :update-function="updateEquipmentProficiency"
      />
    </div>
  </client-only>
</template>

<script setup lang="ts">
import type { Professional } from '../../../../models/profiles/Professional.model'
import { professionalConfig } from '../../../../models/profiles/Professional.model'

// Component props
const props = defineProps<{
  professional: Professional
}>()

// Use the unified profile update composable
const { updateProfile } = useProfileUpdate(professionalConfig)

// Update functions for each field
const updateProfessionalName = (value: string) =>
  updateProfile({ professional_name: value }, props.professional.uid)

const updateTitle = (value: string) =>
  updateProfile({ title: value }, props.professional.uid)

const updateYearsExperience = (value: number) =>
  updateProfile({ years_experience: value }, props.professional.uid)

const updateBioShort = (value: string) =>
  updateProfile({ bio_short: value }, props.professional.uid)

const updateBioLong = (value: string) =>
  updateProfile({ bio_long: value }, props.professional.uid)

const updateHourlyRate = (value: number) =>
  updateProfile({ hourly_rate: value }, props.professional.uid)

const updateSpecialties = (value: string[]) =>
  updateProfile({ specialties: value }, props.professional.uid)

const updateCuisines = (value: string[]) =>
  updateProfile({ cuisines: value }, props.professional.uid)

const updateSkills = (value: string[]) =>
  updateProfile({ skills: value }, props.professional.uid)

const updateCertifications = (value: string[]) =>
  updateProfile({ certifications: value }, props.professional.uid)

const updateLanguages = (value: string[]) =>
  updateProfile({ languages: value }, props.professional.uid)

const updateLocation = (value: string) =>
  updateProfile({ location: value }, props.professional.uid)

const updateAvailabilityStatus = (value: string) =>
  updateProfile({ availability_status: value }, props.professional.uid)

const updateAvailableForTravel = (value: boolean) =>
  updateProfile({ available_for_travel: value }, props.professional.uid)

const updateRemoteWork = (value: boolean) =>
  updateProfile({ remote_work: value }, props.professional.uid)

const updateEducation = (value: string) =>
  updateProfile({ education: value }, props.professional.uid)

const updateWorkAuthorization = (value: string) =>
  updateProfile({ work_authorization: value }, props.professional.uid)

const updateSocialLinks = (value: Record<string, string>) =>
  updateProfile({ social_links: value }, props.professional.uid)

const updateAwards = (value: string[]) =>
  updateProfile({ awards: value }, props.professional.uid)

const updatePreferredJobTypes = (value: string[]) =>
  updateProfile({ preferred_job_types: value }, props.professional.uid)

const updateDietarySpecializations = (value: string[]) =>
  updateProfile({ dietary_specializations: value }, props.professional.uid)

const updateEquipmentProficiency = (value: string[]) =>
  updateProfile({ equipment_proficiency: value }, props.professional.uid)
</script>
