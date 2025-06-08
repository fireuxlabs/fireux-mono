<template>
  <div v-if="!isLoaded">
    <MoleculesLoading />
  </div>
  <div v-else-if="hasAccess">
    <slot />
  </div>
  <div v-else>
    <p class="access-denied">
      Access denied: Anonymous user or insufficient permissions.
    </p>
    <UButton to="/auth" block>Create Account</UButton>
  </div>
</template>

<script setup>
import { getCurrentUser } from 'vuefire'

const currentUserData = await getCurrentUser()
const isLoaded = computed(() => currentUserData !== null)

const hasAccess = computed(() => {
  return currentUserData && !currentUserData.isAnonymous
})
</script>

<style scoped>
.access-denied {
  padding: var(--space-4);
  text-align: center;
  font-size: 1.2rem;
  color: red;
}
</style>