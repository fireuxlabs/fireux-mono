<template>
  <div class="core-user-profile">
    <UCard>
      <div class="profile-header">
        <UAvatar
          :src="coreUser?.avatar"
          :alt="coreUser?.display_name || coreUser?.email || 'Core User'"
          size="lg"
        />
        <div class="profile-meta">
          <h3 class="profile-name">
            {{ coreUser?.display_name || coreUser?.email || 'Core User' }}
          </h3>
          <p v-if="coreUser?.email" class="profile-email">
            {{ coreUser.email }}
          </p>
          <div v-if="coreUser?.id" class="profile-uid">
            <span class="label">ID:</span>
            <code>{{ coreUser.id }}</code>
          </div>
        </div>
      </div>

      <div v-if="coreUser?.dob" class="profile-section">
        <h4 class="section-title">Date of Birth</h4>
        <p>{{ coreUser.dob }}</p>
      </div>

      <div v-if="coreUser?.userOf?.length" class="profile-section">
        <h4 class="section-title">User of Apps</h4>
        <div class="profile-tags">
          <UBadge v-for="app in coreUser.userOf" :key="app" variant="outline">
            {{ app }}
          </UBadge>
        </div>
      </div>

      <div v-if="coreUser?.adminOf?.length" class="profile-section">
        <h4 class="section-title">Admin of Apps</h4>
        <div class="profile-tags">
          <UBadge
            v-for="app in coreUser.adminOf"
            :key="app"
            color="orange"
            variant="soft"
          >
            {{ app }}
          </UBadge>
        </div>
      </div>

      <div v-if="coreUser?.created_in" class="profile-section">
        <h4 class="section-title">Created In</h4>
        <p>{{ coreUser.created_in }}</p>
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
// Props should match CoreUser.Card.Profile interface
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
