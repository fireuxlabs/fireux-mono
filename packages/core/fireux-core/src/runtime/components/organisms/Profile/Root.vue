<template>
  <div class="profile-page">
    {{ hasProfile(config.id) }}

    <!-- Show pill if user has profile, pass actual profile data -->
    <slot v-if="hasProfile(config.id)" name="profile-pill" :profile="current" />

    <!-- Show profile card if user has profile -->
    <slot v-if="hasProfile(config.id)" name="profile-card" :profile="current" />

    <!-- Show profile list with all profiles -->
    <slot
      name="profile-item"
      v-for="profile in all"
      :key="profile.uid"
      :profile="profile"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  config: { type: Object, required: true },
  filterComposable: { type: Function, required: true },
})
const { hasProfile } = await useAppUser()
const { current, all } = await useProfile(props.config)
</script>
