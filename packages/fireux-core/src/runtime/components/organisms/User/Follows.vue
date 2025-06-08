<template>
  <div class="user-follows">
    <h2>Followers &amp; Following</h2>
    <UButton
      variant="outline"
      to="https://fireux.app/projects"
      trailing-icon="i-heroicons-arrow-right"
    >
      Find Users
    </UButton>
    <div v-if="user.follows?.length">
      <h3>Following</h3>
      <ul>
        <li v-for="follow in user.follows" :key="follow.id">
          {{ follow.display_name }}
          <span class="handle">@{{ follow.handle }}</span>
        </li>
      </ul>
    </div>

    <div v-if="user.followedBy?.length">
      <h3>Followers</h3>
      <ul>
        <li v-for="follower in user.followedBy" :key="follower.id">
          {{ follower.display_name }}
          <span class="handle">@{{ follower.handle }}</span>
        </li>
      </ul>
    </div>

    <p v-if="!user.follows?.length && !user.followedBy?.length">
      You haven't connected with anyone yet.
    </p>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    default: () => ({
      follows: [],
      followedBy: []
    })
  }
})
</script>

<style scoped>
.user-follows {
  padding: var(--space-4);
}

.user-follows h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.user-follows h3 {
  font-size: 1.1rem;
  font-weight: 500;
  margin-top: var(--space-3);
}

.user-follows p {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.handle {
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-left: 0.25rem;
}
</style>
