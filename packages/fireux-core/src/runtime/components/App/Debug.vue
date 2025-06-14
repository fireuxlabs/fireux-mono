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
        <pre>Data: {{ JSON.stringify(app, null, 2) }}</pre>

        <h3>Core User</h3>
        <pre>Path: core-users/{{ currentUser?.uid }}</pre>
        <pre>Data: {{ JSON.stringify(coreUser, null, 2) }}</pre>

        <h3>App User</h3>
        <pre>Path: apps/{{ appId }}/users/{{ currentUser?.uid }}</pre>
        <pre>Data: {{ JSON.stringify(appUser, null, 2) }}</pre>
      </div>

      <div class="debug-section">
        <h2>Authentication</h2>
        <pre>Current User: {{ JSON.stringify(currentUser, null, 2) }}</pre>
      </div>

      <div class="debug-section">
        <h2>Relationships</h2>
        <div v-if="coreUser">
          <h3>Core User Apps</h3>
          <p>This user is member of {{ coreUser.userOf?.length || 0 }} apps:</p>
          <ul v-if="coreUser.userOf?.length">
            <li v-for="appId in coreUser.userOf" :key="appId">{{ appId }}</li>
          </ul>
          <p v-else>No app memberships found</p>

          <h3>Core User Admin Access</h3>
          <p>This user is admin of {{ coreUser.adminOf?.length || 0 }} apps:</p>
          <ul v-if="coreUser.adminOf?.length">
            <li v-for="appId in coreUser.adminOf" :key="appId">{{ appId }}</li>
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

      <div class="debug-actions">
        <UButton v-if="!appUser" @click="createAppUser" color="green"
          >Force Create App User</UButton
        >
        <UButton v-if="appUser" @click="refreshData" color="blue"
          >Refresh Data</UButton
        >
      </div>
      add curent user debug here
    </UCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCurrentUser } from 'vuefire'

// Props to allow overriding default visibility
const props = defineProps({
  defaultVisible: {
    type: Boolean,
    default: false,
  },
})

const { devMode, appId } = useFireUXConfig()
const { coreUser } = await useCoreUser()
const { appUser } = await useAppUser()
const { app } = await useApp()
const currentUser = useCurrentUser()

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

async function createAppUser() {
  try {
    // First ensure the core user has the app in its userOf array
    if (coreUser.value && !coreUser.value.userOf?.includes(appId)) {
      const db = useFirestore()
      const { doc, updateDoc, arrayUnion } = await import('firebase/firestore')
      const coreUserRef = doc(db, 'core-users', currentUser.value.uid)
      await updateDoc(coreUserRef, {
        userOf: arrayUnion(appId),
      })
      console.log(`✅ Added ${appId} to core user's userOf array`)
    }

    // Then ensure the app user exists
    const { useAppUserEnsure } = await import(
      '../../composables/firestore/AppUser/useAppUserEnsure'
    )
    const ensureAppUser = useAppUserEnsure()
    await ensureAppUser(coreUser.value)
    console.log('✅ Manually triggered app user creation')

    // Force refresh the page to see the updated data
    window.location.reload()
  } catch (error) {
    console.error('❌ Error creating app user:', error)
  }
}

async function refreshData() {
  window.location.reload()
}
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

.debug-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}

.debug-section h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--primary
}

.debug-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 1rem;
}
</style>
