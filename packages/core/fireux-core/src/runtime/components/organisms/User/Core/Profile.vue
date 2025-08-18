<template>
  <div class="core-user-profile-display">
    <UCard>
      <div class="profile-header">
        <UAvatar
          :src="coreUser?.avatarUrl"
          :alt="coreUser?.displayName || 'Core User'"
          size="lg"
        />
        <div class="profile-info">
          <h2 class="profile-name">
            {{ coreUser?.displayName || 'Core User' }}
          </h2>
          <p v-if="coreUser?.email" class="profile-email">
            {{ coreUser.email }}
          </p>
        </div>
        <div class="profile-actions">
          <UButton color="primary" variant="soft" @click="$emit('edit')">
            Edit Profile
          </UButton>
        </div>
      </div>

      <div v-if="coreUser?.bio" class="profile-section">
        <h3 class="section-title">About</h3>
        <p class="bio-text">{{ coreUser.bio }}</p>
      </div>

      <div v-if="coreUser?.profiles?.length" class="profile-section">
        <h3 class="section-title">Active Profiles</h3>
        <div class="profiles-grid">
          <div
            v-for="profile in coreUser.profiles"
            :key="profile"
            class="profile-badge"
            @click="$emit('profile-click', profile)"
          >
            <span class="profile-name">{{ profile }}</span>
            <UIcon
              name="i-heroicons-arrow-top-right-on-square"
              class="profile-icon"
            />
          </div>
        </div>
      </div>

      <div v-else class="profile-section">
        <div class="no-profiles">
          <UIcon name="i-heroicons-user-plus" class="empty-icon" />
          <h3>No Active Profiles</h3>
          <p>This user hasn't created any profiles yet.</p>
          <UButton color="primary" @click="$emit('create-profile')">
            Create First Profile
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
defineProps({
  coreUser: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['edit', 'profile-click', 'create-profile'])
</script>

