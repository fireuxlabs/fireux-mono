<template>
  <div class="profile-page">
    <!-- Debug Data Section -->
    <div
      style="
        margin-bottom: 2rem;
        padding: 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
      "
    >
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem">
        <button @click="copyData" class="btn btn-primary">
          📋 Copy Combined Data
        </button>
        <button @click="toggleRaw" class="btn btn-secondary">
          {{ showRaw ? 'Hide' : 'Show' }} Raw Data
        </button>
      </div>
      <div v-if="showRaw">
        <h3>Professionals Collection:</h3>
        <pre style="max-height: 200px; overflow-y: auto; font-size: 12px">{{
          professionals
        }}</pre>
        <h3>App Users Collection:</h3>
        <pre style="max-height: 200px; overflow-y: auto; font-size: 12px">{{
          appusers
        }}</pre>
      </div>
    </div>

    <!-- Professional Profile Status Section -->
    <div class="profile-status-section">
      <div
        v-if="hasProfessionalProfile"
        class="profile-status-card profile-status-active"
      >
        <div class="profile-status-content">
          <h2 class="profile-status-title">
            ✅ You have a Professional profile
          </h2>
          <p class="profile-status-description">
            Your professional profile is active and visible to potential
            employers.
          </p>
          <div class="profile-status-actions">
            <NuxtLink
              to="/dashboard/professional-profile"
              class="btn btn-primary"
            >
              View Your Profile
            </NuxtLink>
            <NuxtLink
              to="/dashboard/professional-profile"
              class="btn btn-secondary"
            >
              Edit Profile
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="profile-status-card profile-status-inactive">
        <div class="profile-status-content">
          <h2 class="profile-status-title">
            💼 Create your Professional profile
          </h2>
          <p class="profile-status-description">
            Join our network of skilled professionals and connect with potential
            employers.
          </p>
          <div class="profile-status-actions">
            <NuxtLink
              to="/dashboard/professional-profile"
              class="btn btn-primary"
            >
              Create Professional Profile
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-page-header">
      <h1 class="profile-page-title">Browse Professionals</h1>
      <p class="profile-page-description">
        Find skilled culinary professionals for your next project or position.
      </p>
    </div>
    <div class="profile-page-content">
      <FireOrganismsProfilesProfessionalList
        :professionals="professionals"
        :loading="loading"
      />
    </div>
  </div>
</template>

<script setup>
import { useProfile } from '../../../../../fireux-core/src/runtime/composables/firestore/profiles/useProfile'
import { professionalConfig } from '../../models/profiles/Professional.model'

// Set page meta
definePageMeta({
  title: 'Browse Professionals',
  description: 'Find skilled culinary professionals for your projects',
})

// Use the profile composable to fetch professionals
const { all: professionals, loading } = await useProfile(professionalConfig)

// Fetch app users to see what's in the collection
const { appUsers: appusers } = await useAppUser()

// Get current user and check if they have a professional profile
const { appUser } = await useAppUser()
const hasProfessionalProfile = computed(() => {
  if (!appUser.value) return false
  return (
    appUser.value.profiles?.some(
      (profile) => profile.type === 'professional' && profile.is_active
    ) || false
  )
})

// Debug functionality
const showRaw = ref(false)

const toggleRaw = () => {
  showRaw.value = !showRaw.value
}

const copyData = async () => {
  const combinedData = {
    professionals: professionals.value,
    appUsers: appusers.value,
    timestamp: new Date().toISOString(),
    summary: {
      totalProfessionals: professionals.value?.length || 0,
      totalAppUsers: appusers.value?.length || 0,
      professionalsWithAppUsers:
        professionals.value?.filter((professional) =>
          appusers.value?.find((user) => user.uid === professional.uid)
        ).length || 0,
    },
  }

  try {
    await navigator.clipboard.writeText(JSON.stringify(combinedData, null, 2))
    alert('📋 Data copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy:', err)
    alert('❌ Failed to copy data')
  }
}
</script>

<style scoped>
.profile-page {
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Profile Status Section */
.profile-status-section {
  margin-bottom: 3rem;
}

.profile-status-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 2px solid;
}

.profile-status-active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.profile-status-inactive {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.profile-status-content {
  text-align: center;
}

.profile-status-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.profile-status-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.profile-status-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-secondary:hover {
  background: #3b82f6;
  color: white;
}

.profile-page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.profile-page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 1rem;
}

.profile-page-description {
  font-size: 1.125rem;
  color: #6b7280;
  max-width: 32rem;
  margin: 0 auto;
}

.profile-page-content {
  margin-top: 2rem;
}
</style>
