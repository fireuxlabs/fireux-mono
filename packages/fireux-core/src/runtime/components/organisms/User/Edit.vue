<template>
  <client-only>
    <UAvatar :src="props.user?.avatar" alt="User Avatar" size="lg" />
    <FireMoleculesFormsFirestoreAvatarSelection :user="props.user" />
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

// Get the update functions from useAppUser
const {
  updateDisplayName,
  updateHandle,
  updateEmail,
  updateBio,
  updatePhone,
  updateFullName,
  updateAddress,
  updateAvatar,
} = await useAppUser()
</script>
