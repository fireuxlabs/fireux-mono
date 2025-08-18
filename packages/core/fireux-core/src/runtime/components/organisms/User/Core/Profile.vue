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

<style scoped lang="scss">
.core-user-profile-display {
  .profile-header {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    align-items: flex-start;
  }

  .profile-info {
    flex: 1;
  }

  .profile-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: rgb(17 24 39);
  }

  .profile-email {
    color: rgb(107 114 128);
    font-size: 1rem;
    margin: 0 0 0.75rem 0;
  }

  .profile-uid {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;

    .label {
      color: rgb(107 114 128);
      font-weight: 500;
    }

    code {
      background: rgb(249 250 251);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
    }
  }

  .profile-actions {
    flex-shrink: 0;
  }

  .profile-section {
    margin-bottom: 1.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: rgb(17 24 39);
  }

  .bio-text {
    color: rgb(75 85 99);
    line-height: 1.6;
    margin: 0;
  }

  .profiles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
  }

  .profile-badge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgb(239 246 255);
    color: rgb(29 78 216);
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: rgb(29 78 216);
      background: rgb(219 234 254);
    }

    .profile-name {
      font-weight: 600;
    }

    .profile-icon {
      width: 1rem;
      height: 1rem;
      opacity: 0.7;
    }
  }

  .no-profiles {
    text-align: center;
    padding: 2rem;
    color: rgb(107 114 128);

    .empty-icon {
      width: 3rem;
      height: 3rem;
      margin: 0 auto 1rem;
      opacity: 0.5;
    }

    h3 {
      margin: 0 0 0.5rem 0;
      font-weight: 600;
    }

    p {
      margin: 0 0 1.5rem 0;
    }
  }

      p {
      margin: 0 0 1.5rem 0;
    }
  }
}
</style>
