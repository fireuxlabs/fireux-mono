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
