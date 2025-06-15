<template>
  <client-only>
    <div v-if="appUser" class="profile-container">
      <!-- Main Profile Section -->
      <div class="profile-main">
        <UCard class="profile-edit-card">
          <template #header>
            <div class="edit-header">
              <h2 class="profile-section-title">Edit Profile</h2>
              <p class="edit-description">
                Update your profile information and avatar
              </p>
            </div>
          </template>
          <FireOrganismsUserEdit />
        </UCard>
      </div>

      <!-- Profile Info Sidebar -->
      <div class="profile-sidebar">
        <UCard class="profile-summary-card">
          <template #header>
            <h3 class="profile-section-title">Profile</h3>
          </template>
          <FireOrganismsUserCell :user="appUser" />
          <div class="mt-4">
            <FireOrganismsUserSummary :user="appUser" />
          </div>
        </UCard>

        <UCard class="profile-follows-card">
          <FireOrganismsUserFollows :user="appUser" />
        </UCard>

        <UCard class="profile-notifications-card">
          <FireOrganismsUserNotifications
            :notifications="appUser.notifications || []"
          />
        </UCard>
      </div>
    </div>
    <div v-else class="loading-state">
      <UCard>
        <div class="loading-content">
          <UIcon name="i-heroicons-user-circle" class="loading-icon" />
          <p>Loading profile...</p>
        </div>
      </UCard>
    </div>
  </client-only>
</template>

<script setup>
import { getRouteMetaForPath } from '../../composables/utils/useRoutes'

const { label, icon } = getRouteMetaForPath('/dashboard/profile')

definePageMeta({
  layout: 'dashboard',
  layoutProps: {
    dashboardType: 'user-dashboard',
  },
  title: label,
  icon: icon,
})

const { appUser } = useAppUser()
</script>

<style scoped>
.profile-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
}

.profile-main {
  min-width: 0; /* Prevent grid overflow */
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.profile-section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.edit-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.edit-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.profile-edit-card {
  height: fit-content;
}

.profile-summary-card,
.profile-follows-card,
.profile-notifications-card {
  height: fit-content;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: var(--space-6);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
  text-align: center;
}

.loading-icon {
  font-size: 3rem;
  opacity: 0.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-container {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    padding: var(--space-4);
  }

  .profile-sidebar {
    order: -1; /* Show profile summary first on mobile */
  }
}

@media (max-width: 640px) {
  .profile-container {
    padding: var(--space-3);
  }

  .profile-section-title {
    font-size: 1.1rem;
  }
}
</style>
