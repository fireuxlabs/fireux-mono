<template>
  <client-only>
    <UContainer v-if="appUser" class="profile-edit-component">
      <!-- Personal Information Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Personal Information</h3>
            <p class="profile-section-description">
              Update your basic profile details
            </p>
          </div>

          <div class="name-fields-container">
            <FireMoleculesFormsFirestoreSingleField
              label="First Name"
              :firebase-value="appUser.first_name || ''"
              placeholder="Enter your first name"
              :update-function="updateFirstName"
            />

            <FireMoleculesFormsFirestoreSingleField
              label="Middle Name"
              :firebase-value="appUser.middle_name || ''"
              placeholder="Enter your middle name (optional)"
              :update-function="updateMiddleName"
            />

            <FireMoleculesFormsFirestoreSingleField
              label="Last Name"
              :firebase-value="appUser.last_name || ''"
              placeholder="Enter your last name"
              :update-function="updateLastName"
            />
          </div>

          <FireMoleculesFormsFirestoreSingleField
            label="Display Name"
            :firebase-value="appUser.display_name || ''"
            placeholder="Enter your display name"
            :update-function="updateDisplayName"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="Handle"
            :firebase-value="appUser.handle || ''"
            placeholder="@username"
            :update-function="updateHandle"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="Bio"
            :firebase-value="appUser.bio || ''"
            placeholder="Tell us about yourself..."
            :update-function="updateBio"
          />
        </div>
      </UCard>

      <!-- Contact Information Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Contact Information</h3>
            <p class="profile-section-description">How others can reach you</p>
          </div>

          <FireMoleculesFormsFirestoreSingleField
            label="Email"
            :firebase-value="appUser.email || ''"
            placeholder="your@email.com"
            :update-function="updateEmail"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="Phone"
            :firebase-value="appUser.phone || ''"
            placeholder="Your phone number"
            :update-function="updatePhone"
          />
        </div>
      </UCard>

      <!-- Location Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Location</h3>
            <p class="profile-section-description">Where you're located</p>
          </div>

          <FireMoleculesFormsFirestoreSingleField
            label="City"
            :firebase-value="appUser.address?.city || ''"
            placeholder="Your city"
            :update-function="updateCity"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="State/Province"
            :firebase-value="appUser.address?.state || ''"
            placeholder="Your state or province"
            :update-function="updateState"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="Country"
            :firebase-value="appUser.address?.country || ''"
            placeholder="Your country"
            :update-function="updateCountry"
          />
        </div>
      </UCard>

      <!-- Profile Picture Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Profile Picture</h3>
            <p class="profile-section-description">
              Upload a profile picture (max 5MB)
            </p>
          </div>

          <div class="avatar-upload-section">
            <div class="current-avatar">
              <UAvatar
                :src="appUser.avatar"
                :alt="getDisplayName(appUser)"
                size="xl"
              />
            </div>
            <!-- Avatar upload functionality can be added here -->
          </div>
        </div>
      </UCard>
    </UContainer>
    <div v-else>
      <UCard>
        <div class="profile-loading-content">
          <UIcon name="i-heroicons-user-circle" class="profile-loading-icon" />
          <p>Loading profile...</p>
        </div>
      </UCard>
    </div>
  </client-only>
</template>

<script setup>
const { appUser } = useAppUser()
const {
  updateFirstName,
  updateMiddleName,
  updateLastName,
  updateDisplayName,
  updateHandle,
  updateBio,
  updatePhone,
  updateCity,
  updateState,
  updateCountry,
} = useAppUserUpdate()

// Helper function to get display name
const getDisplayName = (user) => {
  if (user.first_name && user.last_name) {
    const middleName = user.middle_name ? ` ${user.middle_name}` : ''
    return `${user.first_name}${middleName} ${user.last_name}`
  }
  return user.display_name || 'User'
}
</script>

<style scoped>
/* User Edit Component - Uses shared profile styles from profile.scss */

.name-fields-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--space-3);
}

@media (max-width: 768px) {
  .name-fields-container {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);
  }
}

@media (max-width: 640px) {
  .name-fields-container {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
}
</style>
