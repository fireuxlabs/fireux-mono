<template>
  <div class="user-follows">
    <h2>Followers & Following</h2>

    <div class="follows-content">
      <div v-if="user.follows?.length" class="follow-section">
        <h3>Following ({{ user.follows.length }})</h3>
        <ul class="follows-list">
          <li
            v-for="follow in user.follows"
            :key="follow.id"
            class="follow-item"
          >
            <UAvatar :src="follow.avatar" size="sm" class="follow-avatar" />
            <div class="follow-info">
              <span class="follow-name">{{ follow.display_name }}</span>
              <span class="handle">@{{ follow.handle }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="user.followedBy?.length" class="follow-section">
        <h3>Followers ({{ user.followedBy.length }})</h3>
        <ul class="follows-list">
          <li
            v-for="follower in user.followedBy"
            :key="follower.id"
            class="follow-item"
          >
            <UAvatar :src="follower.avatar" size="sm" class="follow-avatar" />
            <div class="follow-info">
              <span class="follow-name">{{ follower.display_name }}</span>
              <span class="handle">@{{ follower.handle }}</span>
            </div>
          </li>
        </ul>
      </div>

      <div
        v-if="!user.follows?.length && !user.followedBy?.length"
        class="empty-state"
      >
        <p>You haven't connected with anyone yet.</p>
        <UButton
          variant="outline"
          to="https://fireux.app/projects"
          trailing-icon="i-heroicons-arrow-right"
          class="find-users-btn"
        >
          Find Users
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    default: () => ({
      follows: [],
      followedBy: [],
    }),
  },
})
</script>

<style scoped>
.user-follows {
  padding: var(--space-4);
}

.user-follows h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-4);
}

.follows-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.follow-section h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: var(--space-3);
  color: var(--text-primary);
}

.follows-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.follow-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color 0.2s;
}

.follow-item:hover {
  background-color: var(--surface-hover);
}

.follow-avatar {
  flex-shrink: 0;
}

.follow-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.follow-name {
  font-weight: 500;
  font-size: 0.9rem;
}

.handle {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

.empty-state {
  text-align: center;
  padding: var(--space-6);
  color: var(--text-secondary);
}

.empty-state p {
  margin-bottom: var(--space-4);
  font-size: 0.95rem;
}

.find-users-btn {
  margin-top: var(--space-2);
}
</style>
