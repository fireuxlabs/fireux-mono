<template>
  <div class="users-list">
    <div v-if="loading" class="loading-state">
      <FireMoleculesLoading message="Loading users..." />
    </div>

    <div v-else-if="users && users.length > 0" class="users-grid">
      <div v-for="user in users" :key="user.uid" class="user-card">
        <div class="user-header">
          <div class="user-avatar">
            <img
              v-if="user.photoURL"
              :src="user.photoURL"
              :alt="user.display_name"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              <UIcon name="lucide:user" class="avatar-icon" />
            </div>
          </div>
          <div class="user-info">
            <h3 class="display-name">
              {{ user.display_name || 'Anonymous User' }}
            </h3>
            <p v-if="user.handle" class="handle">@{{ user.handle }}</p>
          </div>
        </div>

        <div class="user-meta">
          <div v-if="user.address?.city" class="meta-item">
            <UIcon name="lucide:map-pin" class="meta-icon" />
            <span>{{ user.address.city }}, {{ user.address.state }}</span>
          </div>
          <div class="meta-item">
            <UIcon name="lucide:calendar" class="meta-icon" />
            <span>{{ formatDate(user.createdAt) }}</span>
          </div>
        </div>

        <div class="user-actions">
          <UButton variant="outline" size="sm" :to="`/users/${user.uid}`">
            View Profile
          </UButton>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-content">
        <UIcon name="lucide:users" class="empty-icon" />
        <h3>No Users Found</h3>
        <p>There are no users registered yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Note: This would need actual user collection fetching logic
// For now, this is a placeholder structure
const users = ref([])
const loading = ref(false)

function formatDate(date) {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.users-list {
  width: 100%;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.users-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.user-card {
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  background-color: var(--ui-bg);
  transition: border-color 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.user-card:hover {
  border-color: var(--primary-500);
}

.user-header {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--ui-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-secondary);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.display-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
  word-break: break-word;
}

.handle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.user-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.meta-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

.user-actions {
  margin-top: var(--space-2);
  border-top: 1px solid var(--ui-border);
  padding-top: var(--space-3);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: var(--space-8);
}

.empty-content {
  text-align: center;
  max-width: 300px;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: var(--text-secondary);
  margin: 0 auto var(--space-4) auto;
}

.empty-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.empty-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 640px) {
  .users-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .user-card {
    padding: var(--space-3);
  }
}
</style>
