<template>
  <div class="follows-component">
    <div class="follows-header">
      <h3 class="profile-section-title">Connections</h3>
      <p class="profile-section-description">
        Your professional network and connections
      </p>
    </div>

    <div class="follows-content">
      <!-- Followers Section -->
      <div class="follow-section">
        <div class="follow-section-header">
          <h4 class="follow-section-title">
            <UIcon name="i-heroicons-users" class="inline mr-2" />
            Followers
          </h4>
          <span class="follow-count">{{ followerCount }}</span>
        </div>
        <div v-if="followers?.length" class="follow-list">
          <div
            v-for="follower in followers.slice(0, 5)"
            :key="follower.id"
            class="follow-item"
          >
            <UAvatar
              :src="follower.avatar"
              :alt="follower.full_name || follower.display_name"
              size="sm"
            />
            <span class="follow-name">{{
              follower.full_name || follower.display_name
            }}</span>
          </div>
          <div v-if="followers.length > 5" class="follow-more">
            +{{ followers.length - 5 }} more
          </div>
        </div>
        <div v-else class="follow-empty">
          <p>No followers yet</p>
        </div>
      </div>

      <!-- Following Section -->
      <div class="follow-section">
        <div class="follow-section-header">
          <h4 class="follow-section-title">
            <UIcon name="i-heroicons-user-plus" class="inline mr-2" />
            Following
          </h4>
          <span class="follow-count">{{ followingCount }}</span>
        </div>
        <div v-if="following?.length" class="follow-list">
          <div
            v-for="followedUser in following.slice(0, 5)"
            :key="followedUser.id"
            class="follow-item"
          >
            <UAvatar
              :src="followedUser.avatar"
              :alt="followedUser.full_name || followedUser.display_name"
              size="sm"
            />
            <span class="follow-name">{{
              followedUser.full_name || followedUser.display_name
            }}</span>
          </div>
          <div v-if="following.length > 5" class="follow-more">
            +{{ following.length - 5 }} more
          </div>
        </div>
        <div v-else class="follow-empty">
          <p>Not following anyone yet</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="follow-actions">
        <UButton variant="outline" size="sm"> View All Connections </UButton>
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

// Mock data - replace with actual follows data
const followers = computed(() => props.user.followers || [])
const following = computed(() => props.user.following || [])

const followerCount = computed(() => followers.value.length)
const followingCount = computed(() => following.value.length)
</script>

<style scoped>
.follows-component {
  padding: var(--space-4);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  background-color: var(--ui-bg);
}

.follows-header {
  margin-bottom: var(--space-4);
}

.follows-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.follow-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.follow-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.follow-section-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.follow-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--primary-500);
  background-color: var(--primary-50);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
}

.follow-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.follow-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color 0.2s;
}

.follow-item:hover {
  background-color: var(--ui-bg-elevated);
}

.follow-name {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.follow-more {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
  padding: var(--space-1) var(--space-2);
}

.follow-empty {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-align: center;
  padding: var(--space-3);
}

.follow-actions {
  margin-top: var(--space-2);
  display: flex;
  justify-content: center;
}
</style>
