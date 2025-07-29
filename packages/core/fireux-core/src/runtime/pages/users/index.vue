<template>
  <div>
    <div class="mb-4 space-x-4">
      <button @click="copyToClipboard" class="btn btn-primary">
        📋 Copy JSON to Clipboard
      </button>
      <button @click="restoreUserProfiles" class="btn btn-warning">
        🔧 Phase 2: Add Profiles to Users
      </button>
    </div>
    <pre>
allAppUsers
      {{ JSON.stringify(allAppUsers, null, 2) }}</pre
    >
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

const { allAppUsers } = await useAppUser()
const { updateProfiles } = useAppUserUpdate()
const { appId } = useFireUXConfig()
const db = useFirestore()

// Function to restore profiles for users who had them
const restoreUserProfiles = async () => {
  console.log(
    '🔧 Starting Phase 2: Add simple string array profiles to users...'
  )

  let migratedCount = 0

  // Define which users should have which profiles based on their data
  const userProfileMappings = {
    // Chef profiles (users with chef-related bios or known chefs)
    'joey.dean': ['chef'],
    henrique_macedo: ['chef'],
    shane802: ['chef'],
    NagelSebi: ['chef'],
    Pescchheeee: ['chef'],
    pilchy: ['chef'],
    davecook241: ['chef'],
    ddddeano: ['chef', 'professional', 'supplier'], // admin with all marketplace profiles

    // Regular users get no profiles
  }

  for (const user of allAppUsers.value || []) {
    if (!user.uid) continue

    try {
      const userRef = doc(db, `apps/${appId}/users`, user.uid)
      const userProfiles = userProfileMappings[user.handle] || []

      // Only add profiles array if user should have profiles
      const updateData = {
        updated_at: new Date().toISOString(),
      }

      if (userProfiles.length > 0) {
        updateData.profiles = userProfiles
      }

      await updateDoc(userRef, updateData)

      migratedCount++
      const profilesText =
        userProfiles.length > 0
          ? `with profiles: ${userProfiles.join(', ')}`
          : 'with no profiles'
      console.log(`✅ Updated ${user.handle || user.uid} ${profilesText}`)
    } catch (error) {
      console.error(`❌ Failed to migrate ${user.handle || user.uid}:`, error)
    }
  }

  console.log(
    `🎉 Phase 2 completed! Updated profiles for ${migratedCount} users`
  )
}

// Automatically restore profiles when page loads
onMounted(() => {
  restoreUserProfiles()
})

const copyToClipboard = async () => {
  const textToCopy = JSON.stringify(allAppUsers, null, 2)

  // Create a temporary textarea
  const textarea = document.createElement('textarea')
  textarea.value = textToCopy
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)

  alert('📋 Copied!')
}
</script>
