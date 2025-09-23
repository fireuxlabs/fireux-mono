<template>
  <ClientOnly>
    <UCard class="space-y-6">
      <!-- Avatar -->
      <MoleculesFormsFirestoreAvatarSelection
        :user="{ ...chef, avatar_url: chef?.avatar }"
      />

      <!-- Display Name -->
      <MoleculesFormsFirestoreField
        label="Display Name"
        :firebase-value="chef?.display_name"
        placeholder="Enter your display name"
        :update-function="(v) => updateProfile({ display_name: v })"
      />

      <!-- Title -->
      <MoleculesFormsFirestoreField
        label="Title"
        :firebase-value="chef?.title"
        placeholder="e.g., Executive Chef"
        :update-function="(v) => updateProfile({ title: v })"
      />

      <!-- Bio Short -->
      <MoleculesFormsFirestoreField
        label="Short Bio"
        :firebase-value="chef?.bio_short"
        placeholder="A quick summary..."
        type="textarea"
        :rows="3"
        :maxlength="200"
        :update-function="(v) => updateProfile({ bio_short: v })"
      />

      <!-- Bio Long -->
      <MoleculesFormsFirestoreField
        label="Detailed Bio"
        :firebase-value="chef?.bio_long"
        placeholder="Tell your full story..."
        type="textarea"
        :rows="6"
        :maxlength="1000"
        :update-function="(v) => updateProfile({ bio_long: v })"
      />

      <!-- Specialties -->
      <MoleculesFormsFirestoreArrayOfStrings
        label="Specialties"
        :firebase-value="chef?.specialties"
        placeholder="e.g., Pastry, French Cuisine"
        :update-function="(v) => updateProfile({ specialties: v })"
      />
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Chef } from '../../../../models/profiles/Chef.model'
import { chefConfig } from '../../../../models/profiles/Chef.model'
import { useProfileUpdate } from 'fireux-core/runtime/composables/firestore/profiles/useProfileUpdate'

const props = defineProps<{
  chef: Chef
}>()

// Use unified profile updater
const { updateProfile } = useProfileUpdate(chefConfig)
</script>