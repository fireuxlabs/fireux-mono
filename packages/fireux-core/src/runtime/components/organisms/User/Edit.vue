<template>
  <client-only>
    <UContainer v-if="appUser" class="edit-component">
      
      <!-- Avatar Selection Component -->
      <MoleculesFormsFirestoreAvatarSelection />

      <!-- Single Fields -->
      <MoleculesFormsFirestoreSingleField
        label="Display Name"
        :firebase-value="appUser.display_name"
        placeholder="Enter your display name"
        :update-function="
          newValue => saveField('Display Name', 'display_name', newValue)
        "
      />
      <MoleculesFormsFirestoreSingleField
        label="Handle"
        :firebase-value="appUser.handle || ''"
        placeholder="Enter your handle"
        :update-function="
          newValue => saveField('Handle', 'handle', newValue.toLowerCase())
        "
      />
      <MoleculesFormsFirestoreSingleField
        label="Status"
        :firebase-value="appUser.status || ''"
        placeholder="Enter your status"
        :update-function="newValue => saveField('Status', 'status', newValue)"
      />

      <!-- Multi-Field for Address -->
      <MoleculesFormsFirestoreMultiField
        label="Address"
        :firebase-value="appUser.address"
        placeholder="Enter your address"
        :update-function="newValue => saveField('Address', 'address', newValue)"
        :placeholders="{
          street: 'Street Address',
          city: 'City',
          state: 'State',
          zip: 'Zip Code'
        }"
      />

      <!-- Array of Strings for Specialities -->
      <MoleculesFormsFirestoreArrayOfStrings
        label="Specialities"
        :firebase-value="appUser.specialities"
        new-item-placeholder="Add a speciality"
        :update-function="
          newValue => saveField('Specialities', 'specialities', newValue)
        "
      />
    </UContainer>
    <div v-else>
      <MoleculesLoading message="Loading profile..." />
    </div>
  </client-only>
</template>

<script setup>
const { appUser, updateAppProfile } = useAppUser()
const { saveField } = useEditHandler(updateAppProfile)
</script>
