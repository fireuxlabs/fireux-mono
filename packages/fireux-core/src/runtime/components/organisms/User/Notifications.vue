<template>
  <div class="notifications">
    <h2>Notifications</h2>
    <div v-if="notifications.length" class="notifications-list">
      <div
        v-for="(note, index) in notifications"
        :key="index"
        class="notification-item"
      >
        <div class="notification-content">
          <UIcon name="i-heroicons-bell" class="notification-icon" />
          <span class="notification-message">{{ note.message }}</span>
        </div>
        <time class="timestamp">{{ formatDate(note.created_at) }}</time>
      </div>
    </div>
    <div v-else class="empty-notifications">
      <UIcon name="i-heroicons-bell-slash" class="empty-icon" />
      <p>No new notifications.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  notifications: {
    type: Array,
    default: () => [],
  },
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString()
}
</script>

<style scoped>
.notifications {
  padding: var(--space-4);
}

.notifications h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background-color: var(--surface-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
}

.notification-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.notification-message {
  font-size: 0.95rem;
  line-height: 1.4;
}

.timestamp {
  color: var(--text-secondary);
  font-size: 0.8rem;
  flex-shrink: 0;
  margin-left: var(--space-3);
}

.empty-notifications {
  text-align: center;
  padding: var(--space-8);
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.empty-notifications p {
  font-size: 0.95rem;
}
</style>
