<template>
  <div class="user-cell">
    <div class="user-avatar">
      <img v-if="user.avatar" :src="user.avatar" :alt="user.display_name" />
      <div v-else class="avatar-placeholder">
        {{ user.display_name?.charAt(0) || user.email?.charAt(0) }}
      </div>
    </div>
    <div class="user-info">
      <h3 class="user-name">{{ user.display_name || user.email }}</h3>
      <p class="user-email">{{ user.email }}</p>
      <span v-if="user.role" class="user-role">{{ user.role }}</span>
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
</script>

<style scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  background: var(--ui-bg);
}

.user-avatar img,
.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ui-primary);
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.user-email {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}

.user-role {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: var(--ui-primary);
  color: white;
  border-radius: 1rem;
  font-size: 0.75rem;
  text-transform: capitalize;
}
</style>
