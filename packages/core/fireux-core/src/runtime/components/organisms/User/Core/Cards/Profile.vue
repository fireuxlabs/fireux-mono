<template>
  <div class="core-user-profile">
    <UCard>
      <div class="profile-header">
        <UAvatar
          :src="coreUser?.avatarUrl"
          :alt="coreUser?.displayName || 'Core User'"
          size="lg"
        />
        <div class="profile-meta">
          <h3 class="profile-name">
            {{ coreUser?.displayName || 'Core User' }}
          </h3>
          <p v-if="coreUser?.email" class="profile-email">
            {{ coreUser.email }}
          </p>
          <div v-if="coreUser?.uid" class="profile-uid">
            <span class="label">UID:</span>
            <code>{{ coreUser.uid }}</code>
          </div>
        </div>
      </div>

      <div v-if="coreUser?.bio" class="profile-section">
        <h4 class="section-title">Bio</h4>
        <p class="bio-text">{{ coreUser.bio }}</p>
      </div>

      <div v-if="coreUser?.profiles?.length" class="profile-section">
        <h4 class="section-title">Active Profiles</h4>
        <div class="profile-tags">
          <span v-for="profile in coreUser.profiles" :key="profile" class="tag">
            {{ profile }}
          </span>
        </div>
      </div>

      <!-- Profile Creation Actions -->
      <div class="profile-actions">
        <UButton
          color="primary"
          variant="solid"
          @click="$emit('create-profile')"
        >
          Create New Profile
        </UButton>
        <UButton color="gray" variant="soft" @click="$emit('edit-profile')">
          Edit Core User
        </UButton>
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

defineEmits(['create-profile', 'edit-profile'])
</script>

<style scoped lang="scss">
.core-user-profile {
  .profile-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: center;
  }

  .profile-meta {
    flex: 1;
  }

  .profile-name {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
  }

  .profile-email {
    color: rgb(107 114 128);
    font-size: 0.875rem;
    margin: 0 0 0.5rem 0;
  }

  .profile-uid {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;

    .label {
      color: rgb(107 114 128);
      font-weight: 500;
    }

    code {
      background: rgb(249 250 251);
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
    }
  }

  .profile-section {
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: rgb(17 24 39);
  }

  .bio-text {
    color: rgb(75 85 99);
    line-height: 1.6;
    margin: 0;
  }

  .profile-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .tag {
      background: rgb(239 246 255);
      color: rgb(29 78 216);
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
  }

  .profile-actions {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
}
</style>
