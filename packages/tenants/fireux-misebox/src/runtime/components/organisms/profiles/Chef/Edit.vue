<template>
  <client-only>
    <div class="profile-edit-container">
      <!-- Avatar Upload -->
      <FireMoleculesFormsFirestoreAvatarSelection
        :user="{
          ...props.chef,
          avatar_url: props.chef?.avatarUrl,
        }"
      />

      <!-- Chef Name Field (Primary Identifier) -->
      <FireMoleculesFormsFirestoreField
        label="Chef Name"
        :firebase-value="props.chef?.chef_name"
        placeholder="Enter your professional chef name"
        :update-function="updateChefName"
      />

      <!-- Title Field -->
      <FireMoleculesFormsFirestoreField
        label="Professional Title"
        :firebase-value="props.chef?.title"
        placeholder="e.g., Executive Chef, Head Chef, Sous Chef"
        :update-function="updateTitle"
      />

      <!-- Bio Short Field -->
      <FireMoleculesFormsFirestoreField
        label="Short Bio"
        :firebase-value="props.chef?.bio_short"
        placeholder="Brief description of your culinary style..."
        type="textarea"
        :rows="3"
        :maxlength="200"
        :update-function="updateBioShort"
      />

      <!-- Bio Long Field -->
      <FireMoleculesFormsFirestoreField
        label="Detailed Biography"
        :firebase-value="props.chef?.bio_long"
        placeholder="Tell your culinary story in detail..."
        type="textarea"
        :rows="6"
        :maxlength="1000"
        :update-function="updateBioLong"
      />

      <!-- Specialties Array -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Culinary Specialties"
        :firebase-value="props.chef?.specialties || []"
        item-placeholder="Specialty"
        new-item-placeholder="Add new specialty (e.g., French Cuisine, Pastry, etc.)"
        :update-function="updateSpecialties"
      />

      <!-- Years Experience Field -->
      <FireMoleculesFormsFirestoreField
        label="Years of Experience"
        :firebase-value="props.chef?.years_experience"
        placeholder="Enter number of years"
        type="number"
        :update-function="updateYearsExperience"
      />

      <!-- Cuisine Expertise Array -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Cuisine Expertise"
        :firebase-value="props.chef?.cuisine_expertise || []"
        item-placeholder="Cuisine type"
        new-item-placeholder="Add cuisine expertise (e.g., Italian, Asian, etc.)"
        :update-function="updateCuisineExpertise"
      />

      <!-- Contact Information -->
      <FireMoleculesFormsFirestoreField
        label="Email"
        :firebase-value="props.chef?.email"
        placeholder="your.email@example.com"
        type="email"
        :update-function="updateEmail"
      />

      <FireMoleculesFormsFirestoreField
        label="Phone"
        :firebase-value="props.chef?.phone"
        placeholder="(123) 456-7890"
        type="phone"
        :update-function="updatePhone"
      />

      <!-- Location Information -->
      <FireMoleculesFormsFirestoreMultiField
        label="Location"
        :firebase-value="props.chef?.location || {}"
        :placeholders="{
          city: 'City',
          state: 'State/Province',
          country: 'Country',
        }"
        :update-function="updateLocation"
        :commas="true"
      />

      <!-- Social Links -->
      <FireMoleculesFormsFirestoreSocialLinks
        label="Social Media"
        :firebase-value="props.chef?.social_links || {}"
        :update-function="updateSocialLinks"
      />

      <!-- Availability Select -->
      <FireMoleculesFormsFirestoreSelect
        label="Availability"
        :firebase-value="props.chef?.availability || 'available'"
        :options="[
          { label: 'Available', value: 'available' },
          { label: 'Busy', value: 'busy' },
          { label: 'Unavailable', value: 'unavailable' },
        ]"
        placeholder="Select availability status"
        :update-function="updateAvailability"
      />

      <!-- Verified Checkbox -->
      <FireMoleculesFormsFirestoreCheckbox
        label="Profile Verification"
        :firebase-value="props.chef?.verified || false"
        checkbox-label="Mark as verified chef profile"
        :update-function="updateVerified"
      />
    </div>
  </client-only>
</template>

<script setup>
import { useProfileUpdate } from '../../../../core/fireux-core/src/runtime/composables/firestore/profiles/useProfileUpdate'
import { CHEF_CONFIG } from '../../models/profiles/Chef.model'

// Define props
const props = defineProps({
  chef: {
    type: Object,
    required: true,
  },
})

// Get generic profile update functions
const { updateProfile } = useProfileUpdate(CHEF_CONFIG)

// Create field-specific update functions
const updateChefName = (value) =>
  updateProfile({ chef_name: value }, props.chef.uid)
const updateTitle = (value) => updateProfile({ title: value }, props.chef.uid)
const updateBioShort = (value) =>
  updateProfile({ bio_short: value }, props.chef.uid)
const updateBioLong = (value) =>
  updateProfile({ bio_long: value }, props.chef.uid)
const updateSpecialties = (value) =>
  updateProfile({ specialties: value }, props.chef.uid)
const updateYearsExperience = (value) =>
  updateProfile({ years_experience: parseInt(value) || 0 }, props.chef.uid)
const updateCuisineExpertise = (value) =>
  updateProfile({ cuisine_expertise: value }, props.chef.uid)
const updateEmail = (value) => updateProfile({ email: value }, props.chef.uid)
const updatePhone = (value) => updateProfile({ phone: value }, props.chef.uid)
const updateLocation = (value) =>
  updateProfile({ location: value }, props.chef.uid)
const updateSocialLinks = (value) =>
  updateProfile({ social_links: value }, props.chef.uid)
const updateAvailability = (value) =>
  updateProfile({ availability: value }, props.chef.uid)
const updateVerified = (value) =>
  updateProfile({ verified: value }, props.chef.uid)
</script>
