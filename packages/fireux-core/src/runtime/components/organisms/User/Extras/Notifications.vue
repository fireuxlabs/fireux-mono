<template>
  <div class="notifications-component">
    <div class="notifications-header">
      <h3 class="profile-section-title">Notifications</h3>
      <p class="profile-section-description">
        Recent activity and updates
      </p>
    </div>

    <div class="notifications-content">
      <!-- Notification List -->
      <div v-if="notifications?.length" class="notification-list">
        <div
          v-for="notification in displayedNotifications"
          :key="notification.id"
          class="notification-item"
          :class="{ 'unread': !notification.read }"
        >
          <div class="notification-icon">
            <UIcon
              :name="getNotificationIcon(notification.type)"
              :class="getNotificationIconClass(notification.type)"
            />
          </div>
          <div class="notification-content">
            <p class="notification-message">{{ notification.message }}</p>
            <div class="notification-meta">
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
              <span v-if="!notification.read" class="notification-badge">New</span>
            </div>
          </div>
          <div class="notification-actions">
            <UButton
              v-if="!notification.read"
              variant="ghost"
              size="xs"
              @click="markAsRead(notification.id)"
            >
              Mark Read
            </UButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="notifications-empty">
        <UIcon name="i-heroicons-bell-slash" class="empty-icon" />
        <p class="empty-message">No notifications yet</p>
        <p class="empty-description">
          You'll see updates about your profile, connections, and activities here.
        </p>
      </div>

      <!-- Show More Button -->
      <div v-if="notifications?.length > displayLimit" class="notifications-actions">
        <UButton variant="outline" size="sm" @click="showMore">
          Show {{ notifications.length - displayLimit }} More
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  }
})

const displayLimit = ref(5)

const displayedNotifications = computed(() => {
  return props.notifications.slice(0, displayLimit.value)
})

function getNotificationIcon(type) {
  const icons = {
    follow: 'i-heroicons-user-plus',
    like: 'i-heroicons-heart',
    comment: 'i-heroicons-chat-bubble-left',
    system: 'i-heroicons-cog-6-tooth',
    job: 'i-heroicons-briefcase',
    default: 'i-heroicons-bell'
  }
  return icons[type] || icons.default
}

function getNotificationIconClass(type) {
  const classes = {
    follow: 'text-blue-500',
    like: 'text-red-500',
    comment: 'text-green-500',
    system: 'text-gray-500',
    job: 'text-purple-500',
    default: 'text-gray-400'
  }
  return classes[type] || classes.default
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function markAsRead(notificationId) {
  // TODO: Implement mark as read functionality
  console.log('Mark notification as read:', notificationId)
}

function showMore() {
  displayLimit.value = props.notifications.length
}
</script>

<style scoped>
.notifications-component {
  padding: var(--space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  background-color: var(--ui-bg);
}

.notifications-header {
  margin-bottom: var(--space-4);
}

.notifications-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: var(--ui-bg-elevated);
}

.notification-item.unread {
  background-color: var(--primary-50);
  border-left: 3px solid var(--primary-500);
}

.notification-icon {
  flex-shrink: 0;
  padding: var(--space-1);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: 0.875rem;
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
  line-height: 1.4;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.notification-time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.notification-badge {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--primary-600);
  background-color: var(--primary-100);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
}

.notification-actions {
  flex-shrink: 0;
}

.notifications-empty {
  text-align: center;
  padding: var(--space-8);
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.empty-message {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 var(--space-2) 0;
  color: var(--text-primary);
}

.empty-description {
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

.notifications-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--space-2);
}
</style>
