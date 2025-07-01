<template>
  <client-only>
    <UContainer v-if="appUser" class="profile-edit-component">
      <!-- Edit Toggle Button -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="profile-section-title">Edit Profile Information</h3>
        <UButton
          :icon="
            isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
          variant="ghost"
          size="sm"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? 'Hide' : 'Edit' }}
        </UButton>
      </div>

      <!-- Profile Information Section -->
      <div v-show="isExpanded" class="profile-info-section">
        <div class="profile-fields-container">
          <!-- Avatar Selection Section -->
          <div class="avatar-section">
            <h4 class="profile-section-title">Profile Picture</h4>
            <p class="profile-section-description">
              Upload a profile picture (max 5MB, JPEG/PNG/WebP/GIF)
            </p>
            <FireMoleculesFormsFirestoreAvatarSelection />
          </div>
          <!-- Profile Information Section -->
          <div class="info-section">
            <h3 class="section-title">Personal Information</h3>
            <div class="fields-container">
              <!-- Single Fields -->
              <FireMoleculesFormsFirestoreSingleField
                label="Full Name"
                :firebase-value="appUser.full_name || ''"
                placeholder="Enter your full legal name"
                :update-function="
                  (newValue) => saveField('Full Name', 'full_name', newValue)
                "
              />
              <FireMoleculesFormsFirestoreSingleField
                label="Display Name"
                :firebase-value="appUser.display_name"
                placeholder="Enter your display name"
                :update-function="
                  (newValue) =>
                    saveField('Display Name', 'display_name', newValue)
                "
              />
              <FireMoleculesFormsFirestoreSingleField
                label="Handle"
                :firebase-value="appUser.handle || ''"
                placeholder="Enter your handle"
                :update-function="
                  (newValue) =>
                    saveField('Handle', 'handle', newValue.toLowerCase())
                "
              />
            </div>
          </div>

          <!-- Address Section -->
          <div class="address-section">
            <h3 class="section-title">Location</h3>
            <FireMoleculesFormsFirestoreMultiField
              label="Address"
              :firebase-value="appUser.address"
              placeholder="Enter your address"
              :update-function="
                (newValue) => saveField('Address', 'address', newValue)
              "
              :placeholders="{
                street: 'Street Address',
                city: 'City',
                state: 'State',
                zip: 'Zip Code',
              }"
            />
          </div>
        </div>
      </div>

      <!-- Removed Status Section -->
    </UContainer>
    <div v-else>
      <FireMoleculesLoading message="Loading profile..." />
    </div>
  </client-only>
</template>

<script setup>
import { useEditHandler } from '../../../composables/utils/useEditHandler'

const { appUser, updateAppProfile } = useAppUser()
const { saveField } = useEditHandler(updateAppProfile)

// Toggle state for edit mode
const isExpanded = ref(false)
</script>

<style scoped>
/* User Edit Component - Uses shared profile styles from main.css */
/* All styling is handled by shared profile classes */
</style>
