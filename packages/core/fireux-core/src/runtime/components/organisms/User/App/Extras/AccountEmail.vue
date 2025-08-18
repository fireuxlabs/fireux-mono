<template>
  <client-only>
    <UContainer v-if="appUser" class="profile-edit-component">
      <!-- Edit Toggle Button -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="profile-section-title">Account Email</h3>
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

      <!-- Account Email Section -->
      <div v-show="isExpanded" class="profile-info-section">
        <div class="profile-fields-container">
          <div class="mb-4">
            <p class="profile-section-description">
              Your account email is used for authentication and important
              notifications.
            </p>
          </div>

          <!-- Current Email Display -->
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Current Email</label
            >
            <p class="text-gray-900">{{ appUser.email }}</p>
          </div>

          <!-- Email Change Form -->
          <FireMoleculesFormsFirestoreSingleField
            label="New Email Address"
            :firebase-value="''"
            placeholder="Enter new email address"
            :update-function="
              (newValue) => saveField('Email', 'email', newValue)
            "
            input-type="email"
          />

          <div
            class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
          >
            <div class="flex items-start">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="text-yellow-600 mt-0.5 mr-2"
              />
              <div class="text-sm text-yellow-800">
                <p class="font-medium">Important:</p>
                <p>
                  Changing your email will require email verification and may
                  affect your ability to sign in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
    <div v-else>
      <FireMoleculesLoading message="Loading account information..." />
    </div>
  </client-only>
</template>

<script setup>
import { useEditHandler } from '../../../../composables/utils/useEditHandler'

const { appUser, updateAppProfile } = useAppUser()
const { saveField } = useEditHandler(updateAppProfile)

// Toggle state for edit mode
const isExpanded = ref(false)
</script>

<style scoped>
/* Uses shared profile styles from main.css */
</style>
