<template>
  <client-only>
    <div class="user-edit-container">
      <!-- Current avatar upload -->
      <FireMoleculesFormsFirestoreAvatarSelection :user="props.user" />
      <!-- Display Name Field -->
      <FireMoleculesFormsFirestoreField
        label="Display Name"
        :firebase-value="props.user?.display_name"
        placeholder="Enter your display name"
        :update-function="updateDisplayName"
      />

      <!-- Handle Field -->
      <FireMoleculesFormsFirestoreField
        label="Handle"
        :firebase-value="props.user?.handle"
        placeholder="Enter your handle (e.g., @johndoe)"
        :update-function="updateHandle"
      />

      <!-- Email Field -->
      <FireMoleculesFormsFirestoreField
        label="Email"
        :firebase-value="props.user?.email"
        placeholder="Enter your email address"
        type="email"
        :update-function="updateEmail"
      />

      <FireMoleculesFormsFirestoreMultiField
        label="Full Name"
        :firebase-value="{
          first_name: props.user?.first_name || '',
          middle_name: props.user?.middle_name || '',
          last_name: props.user?.last_name || '',
        }"
        :placeholders="{
          first_name: 'First name',
          middle_name: 'Middle name (optional)',
          last_name: 'Last name',
        }"
        :update-function="updateFullName"
        :commas="false"
      />

      <!-- Bio Field (TextArea) -->
      <FireMoleculesFormsFirestoreField
        label="Bio"
        :firebase-value="props.user?.bio"
        placeholder="Tell us about yourself..."
        type="textarea"
        :rows="4"
        :maxlength="500"
        :update-function="updateBio"
      />

      <!-- Phone Field -->
      <FireMoleculesFormsFirestoreField
        label="Phone"
        :firebase-value="props.user?.phone"
        placeholder="(123) 456-7890"
        type="phone"
        :update-function="updatePhone"
      />

      <!-- Address (MultiField) -->
      <FireMoleculesFormsFirestoreMultiField
        label="Address"
        :firebase-value="props.user?.address || {}"
        :placeholders="{
          city: 'City',
          state: 'State/Province',
          country: 'Country',
        }"
        :update-function="updateAddress"
        :commas="true"
      />

      <!-- Followers (ArrayOfStrings) -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Followers"
        :firebase-value="props.user?.followers || []"
        item-placeholder="User ID"
        new-item-placeholder="Add follower ID"
        :update-function="updateFollowers"
      />

      <!-- Following (ArrayOfStrings) -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Following"
        :firebase-value="props.user?.following || []"
        item-placeholder="User ID"
        new-item-placeholder="Add user ID to follow"
        :update-function="updateFollowing"
      />

      <!-- Notifications (Checkbox Component) -->
      <FireMoleculesFormsFirestoreCheckbox
        label="Enable Notifications"
        :firebase-value="props.user?.notifications?.enabled || false"
        checkbox-label="Receive notifications"
        :update-function="
          (value) => updateNotificationsEnabledBool(value, props.user)
        "
      />

      <!-- Notification Types (if notifications enabled) -->
      <div v-if="props.user?.notifications?.enabled" class="ml-4 space-y-2">
        <FireMoleculesFormsFirestoreCheckbox
          v-for="type in ['email', 'push', 'sms']"
          :key="type"
          :label="`${type.charAt(0).toUpperCase() + type.slice(1)} Notifications`"
          :firebase-value="
            props.user?.notifications?.types?.includes(type) || false
          "
          :checkbox-label="`Enable ${type} notifications`"
          :update-function="
            (enabled) =>
              updateNotificationType(
                props.user?.notifications || {},
                type,
                enabled
              )
          "
        />
      </div>

      <!-- Theme Preferences (Select Component) -->
      <FireMoleculesFormsFirestoreSelect
        label="Theme Preference"
        :firebase-value="props.user?.preferences?.theme || 'light'"
        :options="[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
        ]"
        placeholder="Select theme"
        :update-function="(value) => updateThemeSelect(value, props.user)"
      />

      <!-- Language Preferences (Select Component) -->
      <FireMoleculesFormsFirestoreSelect
        label="Language Preference"
        :firebase-value="props.user?.preferences?.language || 'en'"
        :options="[
          { label: 'English', value: 'en' },
          { label: 'Spanish', value: 'es' },
          { label: 'French', value: 'fr' },
          { label: 'German', value: 'de' },
        ]"
        placeholder="Select language"
        :update-function="(value) => updateLanguageSelect(value, props.user)"
      />
    </div>
  </client-only>
</template>

<script setup>
// Define props
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

// Get update functions from useAppUser
const {
  updateDisplayName,
  updateHandle,
  updateEmail,
  updateBio,
  updatePhone,
  updateFullName,
  updateAddress,
  updateFollowers,
  updateFollowing,
  updateNotificationsEnabledBool,
  updateNotificationType,
  updateThemeSelect,
  updateLanguageSelect,
} = await useAppUser()
</script>

<style scoped>
.user-edit-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style>
