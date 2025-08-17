<template>
  <div class="profile-page">
    <h1>🔍 Development Data Viewer</h1>

    <div class="app-info">
      <h2>📱 App Information</h2>
      <div class="app-item"><strong>Current App ID:</strong> {{ appId }}</div>
    </div>

    <div class="avatar-section">
      <h2>🖼️ User Avatars ({{ appUsers?.length || 0 }})</h2>
      <div class="avatar-grid">
        <div v-for="user in appUsers" :key="user.uid" class="avatar-item">
          <div class="avatar-info">
            <strong>{{ user.display_name || user.email || 'No Name' }}</strong>
            <br />
            <small>UID: {{ user.uid }}</small>
          </div>
          <div class="avatar-display">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              :alt="user.display_name || 'User Avatar'"
              class="avatar-img"
              @error="onAvatarError"
              @load="onAvatarLoad"
            />
            <div v-else class="no-avatar">No Avatar</div>
          </div>
          <div class="avatar-url">
            <strong>URL:</strong> {{ user.avatar || 'No URL' }}
          </div>
        </div>
      </div>
    </div>

    <div class="user-avatar-list">
      <h2>📋 User Avatar URLs List</h2>
      <div class="avatar-list">
        <div v-for="user in appUsers" :key="user.uid" class="avatar-list-item">
          <div class="user-name">
            <strong>{{ user.display_name || user.email || 'No Name' }}</strong>
            <small> ({{ user.uid }})</small>
          </div>
          <div class="avatar-url-text">
            {{ user.avatar || 'No avatar URL' }}
          </div>
        </div>
      </div>
    </div>

    <div class="copy-section">
      <button @click="copyAllData" class="copy-button">📋 Copy All Data</button>
      <button @click="migrateAvatars" class="migrate-button">
        🖼️ Migrate All Avatars
      </button>
      <button @click="migrateGlobalData" class="migrate-button">
        🔄 Migrate Global Data to CoreUser
      </button>
    </div>

    <div class="data-section">
      <h2>👥 App Users ({{ appUsers?.length || 0 }})</h2>
      <pre>{{ appUsers }}</pre>
    </div>

    <div class="data-section">
      <h2>👔 Professionals ({{ professionals?.length || 0 }})</h2>
      <pre>{{ professionals }}</pre>
    </div>

    <div class="data-section">
      <h2>🏢 Employers ({{ employers?.length || 0 }})</h2>
      <pre>{{ employers }}</pre>
    </div>

    <div class="data-section">
      <h2>🏪 Suppliers ({{ suppliers?.length || 0 }})</h2>
      <pre>{{ suppliers }}</pre>
    </div>

    <div class="data-section">
      <h2>�‍🍳 Chefs ({{ chefs?.length || 0 }})</h2>
      <pre>{{ chefs }}</pre>
    </div>

    <div class="summary">
      <h2>📊 Summary</h2>
      <p>App Users: {{ appUsers?.length || 0 }}</p>
      <p>Professionals: {{ professionals?.length || 0 }}</p>
      <p>Employers: {{ employers?.length || 0 }}</p>
      <p>Suppliers: {{ suppliers?.length || 0 }}</p>
      <p>Chefs: {{ chefs?.length || 0 }}</p>
      <p>Total Profiles: {{ totalProfiles }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCurrentUser } from 'vuefire'
import { useAppUser } from '../composables/firestore/AppUser/useAppUser'
import { useCoreUser } from '../composables/firestore/CoreUser/useCoreUser'

// Set page meta
definePageMeta({
  title: 'Development Data Viewer',
  description: 'View all profile data for development',
})

// Use the AppUser composable to fetch app users
const { appUsers } = await useAppUser()

// Get current user for debugging
const currentUser = useCurrentUser()

// Get the appId for debugging
import { useFireUXConfig } from '../composables/FireUXConfig'
const { appId } = useFireUXConfig() // Updated to use `appId`

// Use the profile composable to fetch all profile types
const { all: chefs } = await useProfile(chefConfig)
const { all: suppliers } = await useProfile(supplierConfig)
const { all: professionals } = await useProfile(professionalConfig)
const { all: employers } = await useProfile(employerConfig)

// Computed properties
const totalProfiles = computed(
  () =>
    (chefs.value?.length || 0) +
    (suppliers.value?.length || 0) +
    (professionals.value?.length || 0) +
    (employers.value?.length || 0)
)

// Get all app user UIDs for comparison
const appUserUIDs = computed(
  () => appUsers.value?.map((user) => user.uid) || []
)

// Find profiles without matching app users
const orphanedProfiles = computed(() => {
  const orphans = []

  // Check chefs
  chefs.value?.forEach((chef) => {
    if (!appUserUIDs.value.includes(chef.uid)) {
      orphans.push({
        uid: chef.uid,
        name: chef.chef_name || 'Unknown Chef',
        type: 'Chef',
      })
    }
  })

  // Check professionals
  professionals.value?.forEach((professional) => {
    if (!appUserUIDs.value.includes(professional.uid)) {
      orphans.push({
        uid: professional.uid,
        name:
          professional.displayName ||
          professional.email ||
          'Unknown Professional',
        type: 'Professional',
      })
    }
  })

  // Check suppliers
  suppliers.value?.forEach((supplier) => {
    if (!appUserUIDs.value.includes(supplier.uid || supplier.id)) {
      orphans.push({
        uid: supplier.uid || supplier.id,
        name: supplier.name || 'Unknown Supplier',
        type: 'Supplier',
      })
    }
  })

  // Check employers
  employers.value?.forEach((employer) => {
    if (!appUserUIDs.value.includes(employer.uid)) {
      orphans.push({
        uid: employer.uid,
        name: employer.company_name || employer.name || 'Unknown Employer',
        type: 'Employer',
      })
    }
  })

  return orphans
})

// Find app users without any profiles
const appUsersWithoutProfiles = computed(() => {
  const allProfileUIDs = [
    ...(chefs.value?.map((c) => c.uid) || []),
    ...(professionals.value?.map((p) => p.uid) || []),
    ...(suppliers.value?.map((s) => s.uid || s.id) || []),
    ...(employers.value?.map((e) => e.uid) || []),
  ]

  return (
    appUsers.value?.filter((user) => !allProfileUIDs.includes(user.uid)) || []
  )
})

// Data analysis computed properties
const fetchedUserEmails = computed(() => {
  return (
    appUsers.value?.filter((user) => user.email && user.email.trim() !== '') ||
    []
  )
})

const actualUserCount = computed(() => {
  return appUsers.value?.length || 0
})

const usersWithIncompleteData = computed(() => {
  return (
    appUsers.value?.filter((user) => {
      return (
        !user.email ||
        user.email.trim() === '' ||
        !user.display_name ||
        user.display_name.trim() === '' ||
        !user.role ||
        user.role.trim() === ''
      )
    }) || []
  )
})

const usersWithMixedTimestamps = computed(() => {
  return (
    appUsers.value?.filter((user) => {
      return (
        user.created_at &&
        typeof user.created_at === 'object' &&
        'seconds' in user.created_at
      )
    }) || []
  )
})

const usersWithAppIdField = computed(() => {
  return appUsers.value?.filter((user) => user.appId) || []
})

// Function to get issues for a user
function getUserIssues(user) {
  const issues = []
  if (!user.email || user.email.trim() === '') issues.push('Missing email')
  if (!user.display_name || user.display_name.trim() === '')
    issues.push('Missing display_name')
  if (!user.role || user.role.trim() === '') issues.push('Missing role')
  if (
    user.created_at &&
    typeof user.created_at === 'object' &&
    'seconds' in user.created_at
  ) {
    issues.push('Timestamp format issue')
  }
  return issues
}

// Copy all data function
async function copyAllData() {
  const allData = {
    appUsers: appUsers.value,
    chefs: chefs.value,
    suppliers: suppliers.value,
    professionals: professionals.value,
    employers: employers.value,
    summary: {
      appUsersCount: appUsers.value?.length || 0,
      totalProfiles: totalProfiles.value,
      chefsCount: chefs.value?.length || 0,
      suppliersCount: suppliers.value?.length || 0,
      professionalsCount: professionals.value?.length || 0,
      employersCount: employers.value?.length || 0,
    },
  }

  try {
    await navigator.clipboard.writeText(JSON.stringify(allData, null, 2))
    alert('All data copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy data:', err)
    alert('Failed to copy data to clipboard')
  }
}

// Avatar migration function
async function migrateAvatars() {
  if (!appUsers.value || appUsers.value.length === 0) {
    alert('❌ No users found to migrate')
    return
  }

  const usersToMigrate = appUsers.value.filter(
    (user) =>
      user.avatar &&
      (user.avatar.includes('core-users/') || user.avatar.includes('users/'))
  )

  if (usersToMigrate.length === 0) {
    alert('✅ No avatars need migration (all are already in correct location)')
    return
  }

  const confirmed = confirm(
    `🔧 This will migrate ${usersToMigrate.length} avatars to the correct app storage location. Continue?`
  )
  if (!confirmed) return

  try {
    // Import Firebase Storage functions
    const {
      getStorage,
      ref: storageRef,
      getDownloadURL,
      uploadBytes,
      deleteObject,
    } = await import('firebase/storage')
    const { doc, updateDoc } = await import('firebase/firestore')
    const { useFirestore } = await import('vuefire')

    const storage = getStorage()
    const db = useFirestore()

    let successCount = 0
    let errorCount = 0
    const errors = []

    for (const user of usersToMigrate) {
      try {
        // Parse the old URL to get the storage path
        const oldUrl = user.avatar
        const oldPath = `core-users/${user.uid}/avatar.jpg`
        const newPath = `${appId}/avatars/${user.uid}/avatar.jpg`

        console.log(
          `🔄 Migrating ${user.display_name || user.email}: ${oldPath} → ${newPath}`
        )

        // Download the old image
        const oldRef = storageRef(storage, oldPath)
        const downloadUrl = await getDownloadURL(oldRef)

        // Fetch the image data
        const response = await fetch(downloadUrl)
        const blob = await response.blob()

        // Upload to new location
        const newRef = storageRef(storage, newPath)
        await uploadBytes(newRef, blob)

        // Get new download URL
        const newDownloadUrl = await getDownloadURL(newRef)

        // Update user document with new URL
        const userRef = doc(db, `apps/${appId}/users`, user.uid)
        await updateDoc(userRef, {
          avatar: newDownloadUrl,
          updated_at: new Date().toISOString(),
        })

        console.log(
          `✅ Successfully migrated ${user.display_name || user.email}`
        )
        successCount++

        // Optional: Delete old file (uncomment if you want to clean up)
        // await deleteObject(oldRef)

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error) {
        console.error(
          `❌ Failed to migrate ${user.display_name || user.email}:`,
          error
        )
        errors.push(`${user.display_name || user.email}: ${error.message}`)
        errorCount++
      }
    }

    // Show results
    const message = `🎉 Avatar migration complete!\n\n✅ Success: ${successCount} avatars\n❌ Errors: ${errorCount} avatars`

    if (errors.length > 0) {
      console.error('Migration errors:', errors)
      alert(`${message}\n\nCheck console for error details.`)
    } else {
      alert(message)
    }

    // Refresh the data to see changes
    if (successCount > 0) {
      window.location.reload()
    }
  } catch (error) {
    console.error('Error in avatar migration:', error)
    alert(`❌ Failed to migrate avatars: ${error.message}`)
  }
}

// Global data migration function
async function migrateGlobalData() {
  if (!appUsers.value || appUsers.value.length === 0) {
    alert('❌ No app users found to migrate')
    return
  }

  // Find users that have data to migrate
  const usersToMigrate = appUsers.value.filter(
    (user) =>
      user.subscription ||
      user.followers ||
      user.following ||
      user.profiles ||
      user.first_name ||
      user.last_name ||
      user.full_name ||
      user.phone ||
      user.location ||
      user.address ||
      user.email // Legacy email field
  )

  if (usersToMigrate.length === 0) {
    alert(
      '✅ No global data needs migration (all data is already properly located)'
    )
    return
  }

  const confirmed = confirm(
    `🔧 This will migrate global data for ${usersToMigrate.length} users from AppUser to CoreUser.\n\nData to migrate:\n- Subscriptions (global across apps)\n- Social graph (followers/following)\n- Profiles (chef, supplier, etc.)\n- Identity data (name, phone, location)\n\nContinue?`
  )
  if (!confirmed) return

  try {
    const { doc, updateDoc, getDoc } = await import('firebase/firestore')
    const { useFirestore } = await import('vuefire')

    const db = useFirestore()
    let successCount = 0
    let errorCount = 0
    const errors = []

    for (const user of usersToMigrate) {
      try {
        console.log(
          `🔄 Migrating global data for ${user.display_name || user.email}...`
        )

        // Get current CoreUser document
        const coreUserRef = doc(db, 'core-users', user.uid)
        const coreUserDoc = await getDoc(coreUserRef)

        if (!coreUserDoc.exists()) {
          throw new Error(`CoreUser document not found for UID: ${user.uid}`)
        }

        const currentCoreUser = coreUserDoc.data()

        // Prepare global data to migrate
        const globalUpdates = {}

        // Migrate subscription (one subscription works across all apps)
        if (user.subscription && !currentCoreUser.subscription) {
          globalUpdates.subscription = user.subscription
          console.log(`  📋 Migrating subscription: ${user.subscription.plan}`)
        }

        // Migrate social graph (global followers/following)
        if (user.followers && !currentCoreUser.followers) {
          globalUpdates.followers = user.followers
          console.log(`  👥 Migrating ${user.followers.length} followers`)
        }
        if (user.following && !currentCoreUser.following) {
          globalUpdates.following = user.following
          console.log(`  👤 Migrating ${user.following.length} following`)
        }

        // Migrate profiles (convert from simple array to structured format)
        if (user.profiles && !currentCoreUser.profiles) {
          const structuredProfiles = user.profiles.map((profileType) => ({
            type: profileType,
            collection: `${profileType}s`, // chef -> chefs, supplier -> suppliers
            created_at: new Date().toISOString(),
            is_active: true,
          }))
          globalUpdates.profiles = structuredProfiles
          console.log(
            `  🎭 Migrating ${user.profiles.length} profiles: ${user.profiles.join(', ')}`
          )
        }

        // Migrate identity data
        if (user.first_name && !currentCoreUser.first_name) {
          globalUpdates.first_name = user.first_name
        }
        if (user.last_name && !currentCoreUser.last_name) {
          globalUpdates.last_name = user.last_name
        }
        if (user.full_name && !currentCoreUser.full_name) {
          globalUpdates.full_name = user.full_name
        }
        if (user.phone && !currentCoreUser.phone) {
          globalUpdates.phone = user.phone
        }

        // Migrate location data
        if (user.location && !currentCoreUser.location) {
          globalUpdates.location = user.location
          console.log(`  📍 Migrating location: ${user.location.short_address}`)
        }
        if (user.address && !currentCoreUser.address) {
          globalUpdates.address = user.address
        }

        // Update CoreUser with global data
        if (Object.keys(globalUpdates).length > 0) {
          await updateDoc(coreUserRef, {
            ...globalUpdates,
            updated_at: new Date().toISOString(),
          })

          console.log(
            `✅ Migrated ${Object.keys(globalUpdates).length} fields to CoreUser`
          )
          successCount++
        } else {
          console.log(
            `⚪ No new data to migrate for ${user.display_name || user.email}`
          )
        }
      } catch (error) {
        console.error(
          `❌ Error migrating user ${user.display_name || user.email}:`,
          error
        )
        errors.push(`${user.display_name || user.email}: ${error.message}`)
        errorCount++
      }
    }

    // Show results
    const message = `🎉 Global data migration complete!\n\n✅ Success: ${successCount} users migrated\n❌ Errors: ${errorCount} users`

    if (errors.length > 0) {
      console.error('Migration errors:', errors)
      alert(`${message}\n\nCheck console for error details.`)
    } else {
      alert(message)
    }

    // Refresh to see changes
    if (successCount > 0) {
      window.location.reload()
    }
  } catch (error) {
    console.error('Error in global data migration:', error)
    alert(`❌ Failed to migrate global data: ${error.message}`)
  }
}

// Avatar loading functions
function onAvatarError(event) {
  console.error('Avatar failed to load:', event.target.src)
  event.target.style.display = 'none'
}

function onAvatarLoad(event) {
  console.log('Avatar loaded successfully:', event.target.src)
}
</script>

<style scoped>
.profile-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.app-info {
  background: #e0f2fe;
  border: 1px solid #0284c7;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.app-info h2 {
  margin-top: 0;
  color: #0c4a6e;
}

.app-item {
  color: #0c4a6e;
  font-weight: 600;
  font-size: 1.1rem;
}

.copy-section {
  margin-bottom: 2rem;
  text-align: center;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.copy-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-button:hover {
  background: #2563eb;
}

.copy-button:active {
  background: #1d4ed8;
}

.data-section {
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: #f9fafb;
}

.data-section h2 {
  margin-top: 0;
  color: #374151;
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 0.5rem;
}

pre {
  background: #1f2937;
  color: #f3f4f6;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.summary {
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.summary h2 {
  margin-top: 0;
  color: #1e40af;
}

.analysis {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
}

.analysis h2 {
  margin-top: 0;
  color: #92400e;
}

.analysis h3 {
  color: #92400e;
  margin-bottom: 0.5rem;
}

.debug-info {
  background: #fde68a;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.debug-item {
  margin-bottom: 0.5rem;
  color: #92400e;
  font-weight: 500;
}

.missing-users-analysis {
  background: #fef2f2;
  border: 1px solid #ef4444;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.missing-users-analysis h3 {
  color: #dc2626;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.analysis-item {
  margin-bottom: 0.3rem;
  color: #dc2626;
  font-size: 0.9rem;
}

.analysis-section {
  margin-bottom: 1rem;
}

.analysis-section h4 {
  color: #dc2626;
  margin-bottom: 0.5rem;
  margin-top: 0;
}

.issue-user {
  background: #fef2f2;
  border: 1px solid #f87171;
  border-radius: 4px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  color: #991b1b;
  font-size: 0.85rem;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.user-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 0.75rem;
  font-size: 0.85rem;
}

.user-info strong {
  color: #1e40af;
}

.user-info small {
  color: #64748b;
}

.orphaned-profiles,
.app-users-without-profiles {
  margin-bottom: 1.5rem;
}

.orphan-item {
  background: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: 4px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  color: #991b1b;
}

.no-orphans {
  background: #dcfce7;
  border: 1px solid #22c55e;
  border-radius: 4px;
  padding: 0.5rem;
  color: #15803d;
}

.app-users-section {
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.app-users-section h3 {
  color: #0c4a6e;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.teaching-section {
  margin-bottom: 1.5rem;
}

.teaching-section h4 {
  color: #0c4a6e;
  margin-bottom: 0.5rem;
  margin-top: 0;
}

.category-stats,
.profile-stats,
.quality-stats {
  display: grid;
  gap: 0.5rem;
}

.category-item,
.profile-item,
.quality-item {
  background: #e0f2fe;
  border: 1px solid #0284c7;
  border-radius: 4px;
  padding: 0.5rem;
  color: #0c4a6e;
  font-size: 0.9rem;
}

.profile-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-icon {
  font-size: 1.2rem;
}

.avatar-section {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.avatar-section h2 {
  margin-top: 0;
  color: #374151;
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 0.5rem;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.avatar-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.avatar-info {
  font-size: 0.9rem;
}

.avatar-info strong {
  color: #1f2937;
}

.avatar-info small {
  color: #6b7280;
}

.avatar-display {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
}

.avatar-img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.no-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: #9ca3af;
  border: 2px solid #e5e7eb;
}

.avatar-url {
  font-size: 0.75rem;
  color: #6b7280;
  word-break: break-all;
  background: #f9fafb;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.user-avatar-list {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.user-avatar-list h2 {
  margin-top: 0;
  color: #374151;
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 0.5rem;
}

.avatar-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.avatar-list-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1rem;
}

.user-name {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.user-name small {
  color: #6b7280;
  font-weight: normal;
}

.avatar-url-text {
  font-size: 0.8rem;
  color: #4b5563;
  word-break: break-all;
  background: #f9fafb;
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}
</style>
