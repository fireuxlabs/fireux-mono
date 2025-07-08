<template>
  <UCard>
    <div class="appuser-profile-header">
      <UAvatar
        :src="proxiedAvatarUrl"
        :alt="appUserName"
        size="xl"
        :text="getInitials(appUserName)"
      />
      <div class="appuser-info">
        <h2 class="appuser-name">{{ appUserName }}</h2>
        <p v-if="appUser?.email" class="appuser-email">{{ appUser.email }}</p>
        <p v-if="appUser?.handle" class="appuser-handle">
          @{{ appUser.handle }}
        </p>
      </div>
    </div>

    <div v-if="appUser?.bio" class="appuser-about">
      <h3 class="section-title">About</h3>
      <p class="section-content">{{ appUser.bio }}</p>
    </div>

    <div v-if="appUser?.app_id" class="appuser-metadata">
      <h3 class="section-title">App</h3>
      <p class="section-content">{{ appUser.app_id }}</p>
    </div>

    <div v-if="appUser?.created_at" class="appuser-metadata">
      <h3 class="section-title">Member Since</h3>
      <p class="section-content">{{ formattedJoinDate }}</p>
    </div>

    <div
      v-if="appUser?.isAdmin || appUser?.role === 'admin'"
      class="appuser-metadata"
    >
      <h3 class="section-title">Role</h3>
      <UBadge variant="solid" color="primary">Admin</UBadge>
    </div>
  </UCard>
</template>

<script setup>
import { useAvatarProxy } from '../../../composables/utils/useAvatarProxy'

const { getProxiedAvatarUrl } = useAvatarProxy()

// Props from parent
const props = defineProps({
  appUser: {
    type: Object,
    default: null,
  },
})

// Computed property for proxied avatar URL
const proxiedAvatarUrl = computed(() => {
  if (!props.appUser?.avatar) return null
  return getProxiedAvatarUrl(props.appUser.avatar)
})

// Computed property for app user display name
const appUserName = computed(() => {
  if (!props.appUser) return 'AppUser'
  return (
    props.appUser.full_name ||
    props.appUser.display_name ||
    props.appUser.displayName ||
    props.appUser.email ||
    'AppUser'
  )
})

// Computed property for formatted join date
const formattedJoinDate = computed(() => {
  if (!props.appUser?.created_at) return null

  let date
  try {
    date =
      typeof props.appUser.created_at === 'string'
        ? new Date(props.appUser.created_at)
        : props.appUser.created_at

    // Check if date is valid
    if (!date || isNaN(date.getTime())) return null

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (error) {
    console.warn(
      'Invalid date format for appUser created_at:',
      props.appUser.created_at
    )
    return null
  }
})

// Get initials for avatar fallback
function getInitials(name) {
  if (!name) return 'AU'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
.appuser-profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.appuser-info {
  flex: 1;
  min-width: 0;
}

.appuser-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0;
}

.appuser-email {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  margin: var(--space-1) 0 0 0;
}

.appuser-handle {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  font-family: monospace;
  margin: var(--space-1) 0 0 0;
}

.appuser-about,
.appuser-metadata {
  margin-bottom: var(--space-4);
}

.appuser-metadata:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ui-text);
  margin: 0 0 var(--space-2) 0;
}

.section-content {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  margin: 0;
  line-height: 1.5;
}
</style>
