<template>
  <div class="profile-page">
    {{ hasProfile(config.id) }}

    <!-- Show pill if user has profile, pass actual profile data -->
    <slot v-if="hasProfile(config.id)" name="profile-pill" :profile="current" />
  </div>
</template>

<script setup>
const props = defineProps({
  config: { type: Object, required: true },
  filterComposable: { type: Function, required: true },
})
const { hasProfile } = await useAppUser()
const { current } = await useProfile(props.config)
</script>
