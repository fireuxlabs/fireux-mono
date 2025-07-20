<template>
  <div class="summary-component">
    <div class="summary-header">
      <h3 class="profile-section-title">Profile Summary</h3>
    </div>

    <div class="summary-content">
      <!-- User Stats -->
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-value">{{ joinedDate }}</div>
          <div class="stat-label">Member Since</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ profileCompletion }}%</div>
          <div class="stat-label">Profile Complete</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ connectionCount }}</div>
          <div class="stat-label">Connections</div>
        </div>
      </div>

      <!-- Profile Completion Progress -->
      <div class="completion-section">
        <div class="completion-header">
          <h4 class="completion-title">Profile Completion</h4>
          <span class="completion-percentage">{{ profileCompletion }}%</span>
        </div>
        <div class="completion-bar">
          <div
            class="completion-progress"
            :style="{ width: `${profileCompletion}%` }"
          ></div>
        </div>
        <div class="completion-items">
          <div
            v-for="item in completionItems"
            :key="item.key"
            class="completion-item"
            :class="{ completed: item.completed }"
          >
            <UIcon
              :name="
                item.completed
                  ? 'i-heroicons-check-circle'
                  : 'i-heroicons-circle'
              "
              :class="item.completed ? 'text-green-500' : 'text-gray-300'"
            />
            <span class="completion-text">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Profile Info -->
      <div class="profile-info">
        <div v-if="displayName" class="info-item">
          <span class="info-label">Name:</span>
          <span class="info-value">{{ displayName }}</span>
        </div>
        <div v-if="user.email" class="info-item">
          <span class="info-label">Email:</span>
          <span class="info-value">{{ user.email }}</span>
        </div>
        <div v-if="user.handle" class="info-item">
          <span class="info-label">Handle:</span>
          <span class="info-value">@{{ user.handle }}</span>
        </div>
        <div v-if="user.address?.city" class="info-item">
          <span class="info-label">Location:</span>
          <span class="info-value"
            >{{ user.address.city }}, {{ user.address.state }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

// Computed display name with priority logic
const displayName = computed(() => {
  return props.user.full_name || props.user.display_name || 'User'
})

// Member since date
const joinedDate = computed(() => {
  if (!props.user.created_at && !props.user.createdAt) return 'Unknown'
  const date = new Date(props.user.created_at || props.user.createdAt)
  return date.getFullYear()
})

// Connection count (followers + following)
const connectionCount = computed(() => {
  const followers = props.user.followers?.length || 0
  const following = props.user.following?.length || 0
  return followers + following
})

// Profile completion items
const completionItems = computed(() => [
  {
    key: 'avatar',
    label: 'Profile Picture',
    completed: !!props.user.avatar,
  },
  {
    key: 'full_name',
    label: 'Full Name',
    completed: !!props.user.full_name,
  },
  {
    key: 'display_name',
    label: 'Display Name',
    completed: !!props.user.display_name,
  },
  {
    key: 'handle',
    label: 'Handle',
    completed: !!props.user.handle,
  },
  {
    key: 'address',
    label: 'Location',
    completed: !!(props.user.address?.city && props.user.address?.state),
  },
])

// Profile completion percentage
const profileCompletion = computed(() => {
  const completedItems = completionItems.value.filter(
    (item) => item.completed
  ).length
  const totalItems = completionItems.value.length
  return Math.round((completedItems / totalItems) * 100)
})
</script>

<style scoped>
.summary-component {
  padding: var(--space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  background-color: var(--ui-bg);
}

.summary-header {
  margin-bottom: var(--space-4);
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}

.stat-item {
  text-align: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background-color: var(--ui-bg-elevated);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.completion-section {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background-color: var(--ui-bg-elevated);
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.completion-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.completion-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-600);
}

.completion-bar {
  width: 100%;
  height: 8px;
  background-color: var(--ui-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: var(--space-3);
}

.completion-progress {
  height: 100%;
  background-color: var(--primary-500);
  transition: width 0.3s ease;
}

.completion-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.completion-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.completion-item.completed .completion-text {
  color: var(--text-primary);
}

.completion-item:not(.completed) .completion-text {
  color: var(--text-secondary);
}

.completion-text {
  font-size: 0.8rem;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.info-item {
  display: flex;
  gap: var(--space-2);
  align-items: baseline;
}

.info-label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.8rem;
  min-width: 60px;
}

.info-value {
  color: var(--text-primary);
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .summary-stats {
    grid-template-columns: 1fr;
  }

  .completion-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .info-item {
    flex-direction: column;
    gap: var(--space-1);
    align-items: flex-start;
  }

  .info-label {
    min-width: auto;
  }
}
</style>
