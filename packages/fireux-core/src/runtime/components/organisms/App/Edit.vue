<template>
  <client-only>
    <div v-if="app" class="app-edit-component">
      <!-- App Information Section -->
      <UCard>
        <div class="card-content">
          <div class="app-info-header">
            <h3 class="app-name">{{ app.app_name }}</h3>
            <p class="app-id">App ID: {{ app.id }}</p>
          </div>

          <FireMoleculesFormsFirestoreField
            label="Description"
            :firebase-value="app.description || ''"
            placeholder="Describe your application..."
            :update-function="updateDescription"
            type="textarea"
            :rows="3"
            :maxlength="500"
          />
        </div>
      </UCard>

      <!-- Social Links Section -->
      <UCard>
        <div class="card-content">
          <FireMoleculesFormsFirestoreSocialLinks
            :firebase-value="app.social_links || {}"
            :update-function="updateSocialLinks"
          />
        </div>
      </UCard>

      <!-- Admin Management Section -->
      <UCard>
        <div class="card-content">
          <FireMoleculesFormsFirestoreArrayOfStrings
            label="Admin Users"
            :firebase-value="app.admin_ids || []"
            placeholder="Enter user ID or email"
            :update-function="updateAdmins"
          />
        </div>
      </UCard>

      <!-- App Metadata Section -->
      <UCard>
        <div class="card-content">
          <div class="app-metadata">
            <div class="metadata-item">
              <span class="metadata-label">Created:</span>
              <span class="metadata-value">{{
                formatDate(app.created_at)
              }}</span>
            </div>
            <div class="metadata-item" v-if="app.project">
              <span class="metadata-label">Project:</span>
              <span class="metadata-value">{{ app.project }}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Admins:</span>
              <span class="metadata-value"
                >{{ app.admin_ids?.length || 0 }} user(s)</span
              >
            </div>
          </div>
        </div>
      </UCard>
    </div>
    <div v-else>
      <UCard>
        <div class="app-loading-content">
          <UIcon name="i-heroicons-cog-6-tooth" class="app-loading-icon" />
          <p>Loading app settings...</p>
        </div>
      </UCard>
    </div>
  </client-only>
</template>

<script setup>
const { app, updateDescription, updateSocialLinks, updateAdmins } = useApp()

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'

  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}
</script>

<style scoped>
/* App Edit Component - Using FireUX Design System */
.app-edit-component {
  width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .app-edit-component {
    gap: var(--space-6);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .card-content {
    gap: var(--space-6);
  }
}

.app-info-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: var(--space-4);
}

.app-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.app-id {
  font-size: 0.875rem;
  color: #6b7280;
  font-family: monospace;
  margin: 0;
}

.app-metadata {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

@media (min-width: 640px) {
  .app-metadata {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

@media (min-width: 640px) {
  .metadata-item {
    flex-direction: row;
    align-items: center;
    gap: var(--space-2);
  }
}

.metadata-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .metadata-label {
    min-width: 80px;
  }
}

.metadata-value {
  font-size: 0.875rem;
  color: #6b7280;
}

.app-loading-content {
  text-align: center;
  padding: var(--space-8) var(--space-4);
}

@media (min-width: 640px) {
  .app-loading-content {
    padding: var(--space-12) var(--space-4);
  }
}

.app-loading-icon {
  width: var(--space-10);
  height: var(--space-10);
  color: #d1d5db;
  margin: 0 auto var(--space-4) auto;
  display: block;
}

@media (min-width: 640px) {
  .app-loading-icon {
    width: var(--space-12);
    height: var(--space-12);
  }
}
</style>
