<template>
  <div v-if="devMode" class="debug-container">
    <UButton
      class="debug-toggle"
      :color="isVisible ? 'gray' : 'primary'"
      @click="isVisible = !isVisible"
    >
      {{ isVisible ? 'Hide Debug Info' : 'Show Debug Info' }}
    </UButton>

    <UCard v-if="isVisible">
      <h1>Debug Information</h1>

      <div class="debug-section">
        <h2>Configuration</h2>
        <pre>In DevMode: {{ devMode }}</pre>
        <pre>App ID: {{ appId }}</pre>
        <pre>Debug Visibility: {{ isVisible }}</pre>
      </div>

      <div class="debug-section">
        <h2>Database Structure</h2>
        <h3>App Data</h3>
        <pre>Path: apps/{{ appId }}</pre>
        <pre>Data: {{ app }}</pre>

        <h3>Core User</h3>
        <pre>Data: {{ coreUser }}</pre>

        <h3>App User</h3>
        <pre>Data: {{ appUser }}</pre>
      </div>

      <div class="debug-section">
        <h2>Authentication</h2>
        <pre>Current User: {{ currentUser }}</pre>
      </div>

      <div class="debug-section">
        <h2>AppUser/Computed State</h2>
        <pre>appUser: {{ appUser }}</pre>
        <pre>isAppUser: {{ isAppUser }}</pre>
        <pre>isAdmin: {{ isAdmin }}</pre>
        <pre>initials: {{ initials }}</pre>
      </div>

      <div class="debug-section">
        <h2>Relationships</h2>
        <div v-if="coreUserData">
          <h3>Core User Apps</h3>
          <p>
            This user is member of {{ coreUserData.userOf?.length || 0 }} apps:
          </p>
          <ul v-if="coreUserData.userOf?.length">
            <li v-for="appId in coreUserData.userOf" :key="appId">
              {{ appId }}
            </li>
          </ul>
          <p v-else>No app memberships found</p>

          <h3>Core User Admin Access</h3>
          <p>
            This user is admin of {{ coreUserData.adminOf?.length || 0 }} apps:
          </p>
          <ul v-if="coreUserData.adminOf?.length">
            <li v-for="appId in coreUserData.adminOf" :key="appId">
              {{ appId }}
            </li>
          </ul>
          <p v-else>No admin access found</p>
        </div>
      </div>

      <div class="debug-section">
        <h2>Current User Debug</h2>
        <pre>User ID: {{ currentUser?.uid }}</pre>
        <pre>Email: {{ currentUser?.email }}</pre>
        <pre>Display Name: {{ currentUser?.displayName }}</pre>
      </div>

      <!-- Debug actions removed: display only -->
      add curent user debug here
    </UCard>
  </div>
</template>

<script setup>
// All user state and computed props should come from useAppUser
// If any computed values are needed, add them to useAppUserComputed
// Remove direct useCurrentUser import

const props = defineProps({
  defaultVisible: {
    type: Boolean,
    default: false,
  },
})

const { devMode, appId } = useFireUXConfig()

// Use all user state from useAppUser (client-only)
let appUser, isAppUser, isAdmin, initials
if (process.client) {
  ;({ appUser, isAppUser, isAdmin, initials } = await useAppUser())
}

// Use firebase user directly from vuefire
import { useCurrentUser } from 'vuefire'
const currentUser = useCurrentUser()

// For direct core user/app debug, destructure separately
const { coreUser } = await useCoreUser()
const { app } = await useApp()

// Debug visibility state - can be overridden by prop
const isVisible = ref(props.defaultVisible)

// Check URL for debug=true parameter to override default visibility
if (process.client) {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('debug') === 'true') {
    isVisible.value = true
  }
}

console.log('DevMode:', devMode) // Debugging log

// FLAG: If you need any additional computed values for debug, add them to useAppUserComputed
</script>

<style scoped>
.debug-container {
  position: relative;
  margin-bottom: 1rem;
}

.debug-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.debug-toggle:hover {
  opacity: 1;
}
</style>
