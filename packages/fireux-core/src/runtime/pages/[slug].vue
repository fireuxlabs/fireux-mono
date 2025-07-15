<template>
{{ appusers }}
{{ employers }}
{{ chefs }}
..
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

// Composables (we'll need to create these)
// import { useUserBySlug } from '../composables/firestore/users/useUserBySlug'
// import { useProfile } from '../composables/firestore/profiles/useProfile'

const route = useRoute()

// Reactive state
const loading = ref(true)
const error = ref(null)
const user = ref(null)
const profiles = ref({
  chef: null,
  professional: null,
  employer: null,
  supplier: null,
})

// Get slug and requested profile type from route
const slug = computed(() => route.params.slug)
const requestedProfileType = computed(() => {
  // Check if route has a profile type (e.g., /deano-chef/professional)
  const pathSegments = route.path.split('/').filter(Boolean)
  if (pathSegments.length > 1) {
    const profileType = pathSegments[1]
    if (
      ['chef', 'professional', 'employer', 'supplier'].includes(profileType)
    ) {
      return profileType
    }
  }
  return null
})

// Debug mode (show in development)
const showDebug = computed(() => {
  return process.dev || route.query.debug === 'true'
})

// Available profiles for this user
const availableProfiles = computed(() => {
  const available = []
  if (profiles.value.chef) available.push('chef')
  if (profiles.value.professional) available.push('professional')
  if (profiles.value.employer) available.push('employer')
  if (profiles.value.supplier) available.push('supplier')
  return available
})

// Determine which profile to show
const activeProfileType = computed(() => {
  // If specific profile type requested, use that
  if (
    requestedProfileType.value &&
    availableProfiles.value.includes(requestedProfileType.value)
  ) {
    return requestedProfileType.value
  }

  // Otherwise use default profile or first available
  if (
    user.value?.defaultProfile &&
    availableProfiles.value.includes(user.value.defaultProfile)
  ) {
    return user.value.defaultProfile
  }

  // Fallback to first available profile
  return availableProfiles.value[0] || null
})

// Get the active profile data
const activeProfile = computed(() => {
  if (!activeProfileType.value) return null
  return profiles.value[activeProfileType.value]
})

// Helper functions
function getProfileUrl(profileType) {
  if (profileType === activeProfileType.value && !requestedProfileType.value) {
    // This is the default profile, just use the slug
    return `/${slug.value}`
  }
  return `/${slug.value}/${profileType}`
}

function formatProfileType(type) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

async function retryLoad() {
  error.value = null
  await loadUserAndProfiles()
}

// Main loading function
async function loadUserAndProfiles() {
  try {
    loading.value = true
    error.value = null

    console.log(`🔍 Looking up user with slug: ${slug.value}`)

    // Step 1: Find user by slug
    // TODO: Implement useUserBySlug composable
    // const { fetchUserBySlug } = useUserBySlug()
    // user.value = await fetchUserBySlug(slug.value)

    // TEMPORARY: Mock user lookup for development
    // This would be replaced with actual Firestore query
    user.value = await mockFindUserBySlug(slug.value)

    if (!user.value) {
      console.log(`❌ No user found with slug: ${slug.value}`)
      return
    }

    console.log(`✅ Found user: ${user.value.uid} (${user.value.displayName})`)

    // Step 2: Load all available profiles for this user
    await loadAllProfilesForUser(user.value.uid)
  } catch (err) {
    console.error('Error loading user and profiles:', err)
    error.value = err
  } finally {
    loading.value = false
  }
}

async function loadAllProfilesForUser(userUid) {
  console.log(`🔍 Loading all profiles for user: ${userUid}`)

  // Load each profile type
  const profileTypes = ['chef', 'professional', 'employer', 'supplier']

  for (const profileType of profileTypes) {
    try {
      // TODO: Use actual profile configs and composables
      // const config = getProfileConfig(profileType)
      // const { fetchById } = await useProfile(config)
      // profiles.value[profileType] = await fetchById(userUid)

      // TEMPORARY: Mock profile loading
      profiles.value[profileType] = await mockLoadProfile(profileType, userUid)

      if (profiles.value[profileType]) {
        console.log(`✅ Loaded ${profileType} profile`)
      }
    } catch (err) {
      // Profile type not found for this user - this is expected behavior
      console.log(
        `ℹ️ No ${profileType} profile found for user ${userUid}:`,
        err.message || err
      )
      profiles.value[profileType] = null
    }
  }

  console.log(`📊 Available profiles: ${availableProfiles.value.join(', ')}`)
}

// TEMPORARY MOCK FUNCTIONS (to be replaced with real implementations)
async function mockFindUserBySlug(slug) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock user data - this would come from Firestore query
  const mockUsers = {
    'deano-chef': {
      uid: 'jMK33p5XlhYS8rBCEf8qUiogfMg2',
      slug: 'deano-chef',
      displayName: 'Chef Deano',
      defaultProfile: 'chef',
    },
    'john-pro': {
      uid: 'mockuid123',
      slug: 'john-pro',
      displayName: 'John Professional',
      defaultProfile: 'professional',
    },
    'sarah-employer': {
      uid: 'mockuid456',
      slug: 'sarah-employer',
      displayName: "Sarah's Company",
      defaultProfile: 'employer',
    },
  }

  return mockUsers[slug] || null
}

async function mockLoadProfile(profileType, userUid) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200))

  // Mock profile data - this would come from actual Firestore documents
  const mockProfiles = {
    jMK33p5XlhYS8rBCEf8qUiogfMg2: {
      chef: {
        uid: 'jMK33p5XlhYS8rBCEf8qUiogfMg2',
        displayName: 'Chef Deano',
        chef_name: 'Chef Deano',
        avatarUrl: 'https://example.com/avatar.jpg',
        bio_short: 'Passionate Italian chef specializing in authentic cuisine',
        specialties: ['Italian', 'Pasta', 'Pizza'],
      },
    },
    mockuid123: {
      professional: {
        uid: 'mockuid123',
        displayName: 'John Professional',
        avatarUrl: 'https://example.com/john.jpg',
        title: 'Senior Software Engineer',
        bio_short: 'Full-stack developer with 10+ years experience',
      },
    },
  }

  return mockProfiles[userUid]?.[profileType] || null
}

// Load data on mount and when slug changes
onMounted(() => {
  loadUserAndProfiles()
})

watch(
  () => slug.value,
  () => {
    loadUserAndProfiles()
  }
)

// Set page meta
definePageMeta({
  title: computed(() => {
    if (activeProfile.value) {
      const name =
        activeProfile.value.displayName ||
        activeProfile.value.chef_name ||
        activeProfile.value.company_name
      return `${name} - ${formatProfileType(activeProfileType.value)} Profile`
    }
    return 'Profile'
  }),
})
</script>

<style scoped>
.slug-page {
  min-height: 100vh;
  padding: 2rem;
}

.loading-container,
.not-found,
.error-container {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.debug-info {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  font-family: monospace;
}

.debug-info h3 {
  margin-top: 0;
  color: #374151;
}

.profile-navigation {
  margin-bottom: 2rem;
}

.profile-tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 2rem;
}

.profile-tab {
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.profile-tab:hover {
  color: #374151;
  border-bottom-color: #d1d5db;
}

.profile-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 600;
}

.no-profile {
  text-align: center;
  padding: 2rem;
}

.available-profiles {
  margin-top: 1rem;
}

.profile-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.profile-link {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  transition: background 0.2s;
}

.profile-link:hover {
  background: #2563eb;
}

.search-suggestions ul {
  text-align: left;
  max-width: 400px;
  margin: 1rem auto;
}

.back-home,
.retry-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.back-home:hover,
.retry-button:hover {
  background: #2563eb;
}
</style>
