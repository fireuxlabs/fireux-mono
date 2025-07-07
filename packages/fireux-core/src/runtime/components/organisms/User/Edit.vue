<template>
  <client-only>
    <div v-if="appUser" class="profile-edit-component">
      <!-- Profile Picture Section -->
      <UCard>
        <div class="card-content">
          <FireMoleculesFormsFirestoreAvatarSelection
            label="Profile Picture"
            :firebase-value="appUser.avatar"
            :update-function="updateAvatar"
          />
        </div>
      </UCard>

      <!-- Personal Information Section -->
      <UCard>
        <div class="card-content">
          <div class="form-grid">
            <FireMoleculesFormsFirestoreField
              label="Display Name"
              :firebase-value="appUser.display_name || ''"
              placeholder="Enter your display name"
              :update-function="updateDisplayName"
            />

            <FireMoleculesFormsFirestoreField
              label="Handle"
              :firebase-value="appUser.handle || ''"
              placeholder="@username"
              :update-function="updateHandle"
            />
          </div>

          <FireMoleculesFormsFirestoreField
            label="Bio"
            :firebase-value="appUser.bio || ''"
            placeholder="Tell us about yourself..."
            :update-function="updateBio"
            type="textarea"
            :rows="4"
            :maxlength="500"
          />
        </div>
      </UCard>

      <!-- Full Name Section -->
      <UCard>
        <div class="card-content">
          <FireMoleculesFormsFirestoreMultiField
            label="Full Name"
            :firebase-value="{
              first_name: appUser.first_name || '',
              middle_name: appUser.middle_name || '',
              last_name: appUser.last_name || '',
            }"
            :placeholders="{
              first_name: 'Enter first name',
              middle_name: 'Enter middle name (optional)',
              last_name: 'Enter last name',
            }"
            :update-function="updateFullName"
            :commas="false"
          />
        </div>
      </UCard>

      <!-- Contact Information Section -->
      <UCard>
        <div class="card-content">
          <FireMoleculesFormsFirestoreField
            label="Email"
            :firebase-value="appUser.email || ''"
            placeholder="your@email.com"
            :update-function="updateEmail"
            type="email"
          />

          <FireMoleculesFormsFirestoreField
            label="Phone"
            :firebase-value="appUser.phone || ''"
            placeholder="Your phone number"
            :update-function="updatePhone"
            type="phone"
          />
        </div>
      </UCard>

      <!-- Address Section -->
      <UCard>
        <div class="card-content">
          <FireMoleculesFormsFirestoreMultiField
            label="Address"
            :firebase-value="appUser.address || {}"
            :placeholders="{
              street: 'Street address',
              city: 'City',
              state: 'State/Province',
              country: 'Country',
              postal_code: 'Postal code',
            }"
            :update-function="updateAddress"
            :commas="false"
          />
        </div>
      </UCard>
    </div>
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
const {
  appUser,
  updateDisplayName,
  updateHandle,
  updateEmail,
  updateBio,
  updatePhone,
  updateFullName,
  updateAddress,
  updateAvatar,
} = useAppUser()
</script>

<style scoped>
/* User Edit Component - Using FireUX Design System */
.profile-edit-component {
  width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .profile-edit-component {
    gap: var(--space-6);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .card-content {
    gap: var(--space-6);
  }
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .form-grid {
    gap: var(--space-6);
  }
}

.profile-loading-content {
  text-align: center;
  padding: var(--space-8) var(--space-4);
}

@media (min-width: 640px) {
  .profile-loading-content {
    padding: var(--space-12) var(--space-4);
  }
}

.profile-loading-icon {
  width: var(--space-10);
  height: var(--space-10);
  color: #d1d5db;
  margin: 0 auto var(--space-4) auto;
  display: block;
}

@media (min-width: 640px) {
  .profile-loading-icon {
    width: var(--space-12);
    height: var(--space-12);
  }
}
</style>
