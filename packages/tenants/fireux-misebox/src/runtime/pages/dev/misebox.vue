<template>
  <div class="misebox-dev-page">
    <h1>🍳 MiseBox Development Tools</h1>

    <div class="app-info">
      <h2>📱 App Information</h2>
      <div class="app-item"><strong>Current App:</strong> MiseBox</div>
      <div class="app-item"><strong>App ID:</strong> {{ appId }}</div>
    </div>

    <div class="user-section">
      <h2>👥 App Users ({{ appUsers?.length || 0 }})</h2>
      <div class="user-grid">
        <div v-for="user in appUsers" :key="user.uid" class="user-item">
          <div class="user-avatar">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              :alt="user.display_name || 'User Avatar'"
              class="avatar-img"
            />
            <div v-else class="no-avatar">No Avatar</div>
          </div>
          <div class="user-info">
            <strong>{{ user.display_name || user.email || 'No Name' }}</strong>
            <div class="user-details">
              <div><strong>Handle:</strong> {{ user.handle || 'N/A' }}</div>
              <div><strong>Role:</strong> {{ user.role || 'user' }}</div>
              <div v-if="user.profiles"><strong>Profiles:</strong> {{ user.profiles.join(', ') }}</div>
              <div v-if="user.subscription"><strong>Subscription:</strong> {{ user.subscription.plan }} ({{ user.subscription.status }})</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-section">
      <h2>👨‍🍳 Chefs ({{ chefs?.length || 0 }})</h2>
      <div class="profile-grid">
        <div v-for="chef in chefs" :key="chef.uid" class="profile-item">
          <div class="profile-avatar">
            <img
              v-if="chef.avatarUrl"
              :src="chef.avatarUrl"
              :alt="chef.display_name || 'Chef'"
              class="avatar-img"
            />
            <div v-else class="no-avatar">No Avatar</div>
          </div>
          <div class="profile-info">
            <strong>{{ chef.display_name || chef.email || 'Chef' }}</strong>
            <div v-if="chef.bio" class="bio">{{ chef.bio.substring(0, 100) }}...</div>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-section">
      <h2>🏪 Suppliers ({{ suppliers?.length || 0 }})</h2>
      <div class="profile-grid">
        <div v-for="supplier in suppliers" :key="supplier.uid" class="profile-item">
          <div class="profile-avatar">
            <img
              v-if="supplier.avatarUrl"
              :src="supplier.avatarUrl"
              :alt="supplier.display_name || 'Supplier'"
              class="avatar-img"
            />
            <div v-else class="no-avatar">No Avatar</div>
          </div>
          <div class="profile-info">
            <strong>{{ supplier.display_name || supplier.email || 'Supplier' }}</strong>
            <div v-if="supplier.bio" class="bio">{{ supplier.bio.substring(0, 100) }}...</div>
          </div>
        </div>
      </div>
    </div>

    <div class="actions-section">
      <h2>🛠️ Migration Actions</h2>
      <button @click="migrateGlobalData" class="migrate-button">
        🔄 Migrate Global Data to CoreUser
      </button>
      <button @click="copyAllData" class="copy-button">📋 Copy All Data</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define page meta
definePageMeta({
  title: 'MiseBox Development Tools',
  description: 'Development and debugging tools for MiseBox',
})

// Import composables
import { useFireUXConfig } from '#fireux-core-composables'

// Get app configuration
const { appId } = useFireUXConfig()

// Get app users and profile data
const { allAppUsers: appUsers } = await useAppUser()
const { all: chefs } = await useProfile({ 
  collectionName: 'chefs', 
  profileType: 'chef' 
} as any)
const { all: suppliers } = await useProfile({ 
  collectionName: 'suppliers', 
  profileType: 'supplier' 
} as any)

// Copy all data function
async function copyAllData() {
  const allData = {
    app_info: { appId: appId },
    users: appUsers.value,
    chefs: chefs.value,
    suppliers: suppliers.value,
    summary: {
      appUsersCount: appUsers.value?.length || 0,
      chefsCount: chefs.value?.length || 0,
      suppliersCount: suppliers.value?.length || 0,
    },
  }

  try {
    await navigator.clipboard.writeText(JSON.stringify(allData, null, 2))
    alert('MiseBox data copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy data:', err)
    alert('Failed to copy data to clipboard')
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
    (user: any) =>
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
    alert('✅ No global data needs migration (all data is already properly located)')
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
    const errors: string[] = []

    for (const user of usersToMigrate) {
      try {
        console.log(`🔄 Migrating global data for ${user.display_name || user.email}...`)

        // Get current CoreUser document
        const coreUserRef = doc(db, 'core-users', user.uid)
        const coreUserDoc = await getDoc(coreUserRef)
        
        if (!coreUserDoc.exists()) {
          throw new Error(`CoreUser document not found for UID: ${user.uid}`)
        }

        const currentCoreUser = coreUserDoc.data()
        
        // Prepare global data to migrate
        const globalUpdates: any = {}

        // Migrate subscription (one subscription works across all apps)
        if (user.subscription && !currentCoreUser.subscription) {
          globalUpdates.subscription = {
            plan: user.subscription.plan === 'premium' ? 'pro' : user.subscription.plan,
            status: user.subscription.status,
            started_at: user.subscription.started_at,
            is_pro: user.subscription.is_pro
          }
          console.log(`  📋 Migrating subscription: ${user.subscription.plan}`)
        }

        // Migrate profiles (convert from simple array to simple array - already compatible)
        if (user.profiles && !currentCoreUser.profiles) {
          globalUpdates.profiles = user.profiles
          console.log(`  🎭 Migrating ${user.profiles.length} profiles: ${user.profiles.join(', ')}`)
        }

        // Update CoreUser with global data
        if (Object.keys(globalUpdates).length > 0) {
          await updateDoc(coreUserRef, {
            ...globalUpdates,
            updated_at: new Date().toISOString()
          })
          
          console.log(`✅ Migrated ${Object.keys(globalUpdates).length} fields to CoreUser`)
          successCount++
        } else {
          console.log(`⚪ No new data to migrate for ${user.display_name || user.email}`)
        }

      } catch (error: any) {
        console.error(`❌ Error migrating user ${user.display_name || user.email}:`, error)
        errors.push(`${user.display_name || user.email}: ${error.message}`)
        errorCount++
      }
    }

    // Show results
    const message = `🎉 MiseBox global data migration complete!\n\n✅ Success: ${successCount} users migrated\n❌ Errors: ${errorCount} users`

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
  } catch (error: any) {
    console.error('Error in global data migration:', error)
    alert(`❌ Failed to migrate global data: ${error.message}`)
  }
}
</script>

<style scoped>
.misebox-dev-page {
  padding: 20px;
  font-family: system-ui, sans-serif;
}

.app-info, .user-section, .profile-section, .actions-section {
  margin-bottom: 30px;
}

.user-grid, .profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.user-item, .profile-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
}

.user-avatar, .profile-avatar {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.no-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #64748b;
}

.user-info, .profile-info {
  flex: 1;
  min-width: 0;
}

.user-details {
  margin-top: 8px;
  font-size: 13px;
  color: #64748b;
}

.bio {
  margin-top: 5px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.actions-section {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.migrate-button, .copy-button {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.migrate-button {
  background: #3b82f6;
  color: white;
}

.migrate-button:hover {
  background: #2563eb;
}

.copy-button {
  background: #10b981;
  color: white;
}

.copy-button:hover {
  background: #059669;
}

.app-item {
  margin: 8px 0;
  font-size: 14px;
}
</style>
