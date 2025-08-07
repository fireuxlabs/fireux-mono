<template>
  <div class="profile-page">
    {{ hasProfile(config.id) }}

    <!-- Show pill if user has profile -->
    <slot v-if="hasProfile(config.id)" name="profile-pill" />
  </div>
</template>

<script setup>
const props = defineProps({
  config: { type: Object, required: true },
  filterComposable: { type: Function, required: true },
})

// Get the real hasProfile function from useAppUser
const { hasProfile } = await useAppUser()
</script>
