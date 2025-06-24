<template>
  <client-only>
    <div v-if="appUser">
      <UButton color="primary" size="lg" icon="i-heroicons-briefcase">
        Create a Professional Profile
      </UButton>
    </div>
  </client-only>
</template>

<script setup>


definePageMeta({
  layout: 'dashboard',
})

const { appUser } = useAppUser()
</script>
