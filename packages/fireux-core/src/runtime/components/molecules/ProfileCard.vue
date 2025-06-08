<!-- COMMENT: app/components/molecules/ProfileCard.vue -->
<template>
  <UCard class="profile-card">
    <div v-if="user.avatar">
      <UAvatar :src="user.avatar" size="lg" />
    </div>
    <h2 v-if="user.displayName">{{ user.displayName }}</h2>
    <p v-if="user.email">{{ user.email }}</p>
  </UCard>
</template>

<script setup>
const { user } = useAppUser()
</script>

<style scoped>
.profile-card {
  max-width: 800px;
  width: 100%;
  text-align: center;
}
</style>
