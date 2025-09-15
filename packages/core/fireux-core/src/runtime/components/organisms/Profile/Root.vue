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
    <template v-for="profile in list" :key="profile.id || profile.uid">
      <slot
        name="profile-item"
        :profile="profile"
        :navigate="navigateToProfile"
      />
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  config: { type: Object, required: true },
})
const { hasProfile } = useAppUser()
const { ecosystemProfile, appProfile, ecosystemCollection } = useProfile(
  props.config
)

// Current user profile prefers app-scoped, falls back to ecosystem
const current = computed(
  () => appProfile?.value || ecosystemProfile?.value || null
)

// Simple list derived from ecosystem collection
const list = computed(() => ecosystemCollection?.value || [])

// Navigation function for profile clicks
const navigateToProfile = (profile) => {
  if (profile?.uid) {
    navigateTo(`/${props.config.collection}/${profile.uid}`)
  }
}
</script>
