<template>
  <div class="appuser-cell">
    <UAvatar :src="proxiedAvatarUrl" size="lg" />
    <div class="info">
      <strong class="name">{{ displayName }}</strong>
      <span class="handle">@{{ appUser.handle }}</span>
      <UBadge
        v-if="appUser?.isAdmin || appUser?.role === 'admin'"
        variant="subtle"
        class="badge"
      >
        Admin
      </UBadge>
      <UBadge v-if="appUser?.app_id" variant="outline" class="app-badge">
        {{ appUser.app_id }}
      </UBadge>
    </div>
  </div>
</template>

<script setup>
import { useAvatarProxy } from '../../../composables/utils/useAvatarProxy'

const { getProxiedAvatarUrl } = useAvatarProxy()

const props = defineProps({
  appUser: {
    type: Object,
    required: true,
  },
})

// Computed property for proxied avatar URL
const proxiedAvatarUrl = computed(() => {
  if (!props.appUser?.avatar) return null
  return getProxiedAvatarUrl(props.appUser.avatar)
})

// Computed property for display name with full_name priority logic
const displayName = computed(() => {
  if (!props.appUser) return 'Unknown AppUser'

  // Priority: full_name -> display_name -> displayName -> email (without @domain)
  if (props.appUser.full_name) {
    return props.appUser.full_name
  }
  if (
    props.appUser.display_name &&
    props.appUser.display_name !== props.appUser?.email
  ) {
    return props.appUser.display_name
  }
  if (
    props.appUser.displayName &&
    props.appUser.displayName !== props.appUser?.email
  ) {
    return props.appUser.displayName
  }
  if (props.appUser.email) {
    return props.appUser.email.split('@')[0] // Just username part
  }
  return 'Unknown AppUser'
})
</script>

<style scoped>
.appuser-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--space-2);
  transition: background-color 0.2s ease;
}

.appuser-cell:hover {
  background-color: var(--ui-bg-elevated);
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.name {
  font-weight: 600;
  color: var(--ui-text);
  truncate: true;
}

.handle {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  font-family: monospace;
}

.badge,
.app-badge {
  align-self: flex-start;
  margin-top: var(--space-1);
}
</style>
