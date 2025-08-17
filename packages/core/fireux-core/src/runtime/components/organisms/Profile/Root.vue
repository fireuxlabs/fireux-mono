<template>
  <div class="profile-page">
    <!-- Show pill if user has profile, pass actual profile data -->
    <slot
      v-if="hasProfile(config.id)"
      name="profile-pill"
      :profile="current"
      :navigate="navigateToProfile"
    />

    <!-- Show profile card if user has profile -->
    <slot
      v-if="hasProfile(config.id)"
      name="profile-card"
      :profile="current"
      :navigate="navigateToProfile"
    />

    <!-- Show profile list with all profiles -->
    <slot
      name="profile-item"
      v-for="profile in all"
      :key="profile.uid"
      :profile="profile"
      :navigate="navigateToProfile"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  config: { type: Object, required: true },
  filterComposable: { type: Function, required: true },
})
const { hasProfile } = await useCoreUser()
const { current, all } = await useProfile(props.config)

// Navigation function for profile clicks
const navigateToProfile = (profile) => {
  if (profile?.uid) {
    navigateTo(`/${props.config.collection}/${profile.uid}`)
  }
}
</script>
