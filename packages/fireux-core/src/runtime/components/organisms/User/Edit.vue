<template>
  <client-only>
    <UContainer v-if="appUser" class="edit-component">
      <!-- Avatar Selection Section -->
      <div class="avatar-section">
        <h3 class="section-title">Profile Picture</h3>
        <p class="section-description">
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
            label="Display Name"
            :firebase-value="appUser.display_name"
            placeholder="Enter your display name"
            :update-function="
              (newValue) => saveField('Display Name', 'display_name', newValue)
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
</script>

<style scoped>
.edit-component {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 100%;
}

.avatar-section,
.info-section,
.address-section {
  padding: var(--space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  background-color: var(--ui-bg);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.section-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 var(--space-4) 0;
}

.fields-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (max-width: 640px) {
  .edit-component {
    gap: var(--space-4);
  }

  .avatar-section,
  .info-section,
  .address-section {
    padding: var(--space-3);
  }

  .section-title {
    font-size: 1rem;
  }
}
</style>
