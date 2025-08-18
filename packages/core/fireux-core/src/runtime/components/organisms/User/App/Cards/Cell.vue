<template>
  <div class="cell">
    <UAvatar :src="proxiedAvatarUrl" size="lg" />
    <div class="info">
      <strong class="name">{{ displayName }}</strong>
      <span class="handle">@{{ props.user.handle }}</span>
      <UBadge
        v-if="props.user?.isAdmin || props.user?.role === 'admin'"
        variant="subtle"
        class="badge"
        >Admin</UBadge
      >
    </div>
  </div>
</template>

<script setup>
import { useAvatarProxy } from '../../../composables/utils/useAvatarProxy'

const { getProxiedAvatarUrl } = useAvatarProxy()

const props = defineProps({
  user: {
    type: Object,
    default: () => ({}),
  },
})

// Computed property for display name with full_name priority logic
const displayName = computed(() => {
  if (!props.user) return 'Unknown User'

  // Priority: full_name -> display_name -> displayName -> email (without @domain)
  if (props.user.full_name) {
    return props.user.full_name
  }
  if (
    props.user.display_name &&
    props.user.display_name !== props.user?.email
  ) {
    return props.user.display_name
  }
  if (props.user.displayName && props.user.displayName !== props.user?.email) {
    return props.user.displayName
  }
  if (props.user.email) {
    return props.user.email.split('@')[0] // Just username part
  }
  return 'Unknown User'
})

// Use proxied avatar URL to bypass CORS issues with Google images
const proxiedAvatarUrl = computed(() => getProxiedAvatarUrl(props.user?.avatar))
</script>

<style scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.info {
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  font-size: 1rem;
}

.handle {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
</style>
