<template>
  <div class="notifications">
    <h2>Notifications</h2>
    <div v-if="notifications.length">
      <ul>
        <li v-for="(note, index) in notifications" :key="index" class="notification">
          <span>{{ note.message }}</span>
          <time class="timestamp">{{ formatDate(note.created_at) }}</time>
        </li>
      </ul>
    </div>
    <p v-else>No new notifications.</p>
  </div>
</template>

<script setup>
defineProps({
  notifications: {
    type: Array,
    default: () => []
  }
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString()
}
</script>

<style scoped>
.notifications {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.notification {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
}
.timestamp {
  color: var(--text-secondary);
  font-size: 0.8rem;
}
</style>