<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="coreUser?.avatarUrl"
        :alt="coreUser?.displayName || 'Core User'"
        size="md"
      />
      <div class="profile-info">
        <h4 v-if="coreUser?.displayName" class="profile-name">
          {{ coreUser.displayName }}
        </h4>
        <p v-if="coreUser?.email" class="profile-subtitle">
          {{ coreUser.email }}
        </p>
      </div>
    </div>

    <p v-if="coreUser?.bio" class="profile-bio">
      {{ coreUser.bio }}
    </p>

    <div v-if="coreUser?.profiles?.length" class="profile-tags">
      <span
        v-for="profile in coreUser.profiles.slice(0, 3)"
        :key="profile"
        class="tag"
      >
        {{ profile }}
      </span>
      <span v-if="coreUser.profiles.length > 3" class="tag-more">
        +{{ coreUser.profiles.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup>
defineProps({
  coreUser: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<style scoped lang="scss">
.profile-card {
  .profile-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .profile-info {
    flex: 1;
  }

  .profile-name {
    font-weight: 600;
    margin: 0 0 0.25rem 0;
  }

  .profile-subtitle {
    color: rgb(107 114 128);
    font-size: 0.875rem;
    margin: 0;
  }

  .profile-bio {
    color: rgb(75 85 99);
    font-size: 0.875rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .profile-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;

    .tag {
      background: rgb(239 246 255);
      color: rgb(29 78 216);
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .tag-more {
      color: rgb(107 114 128);
      font-size: 0.75rem;
    }
  }
}
</style>
