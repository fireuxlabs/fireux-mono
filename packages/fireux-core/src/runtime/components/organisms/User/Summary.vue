<template>
  <div class="user-summary">
    <UAvatar :src="proxiedAvatarUrl" size="lg" class="avatar" />
    <div class="info">
      <strong class="name">{{ displayName }}</strong>
      <span class="handle">@{{ props.user.handle }}</span>
      <span v-if="props.user.status" class="status">{{
        props.user.status
      }}</span>
      <span v-if="props.user.specialities?.length" class="specialities">
        {{ props.user.specialities.join(' | ') }}
      </span>
      <span v-if="formattedJoinDate" class="joined"
        >Joined: {{ formattedJoinDate }}</span
      >
      <UBadge
        v-if="props.user?.isAdmin || props.user?.role === 'admin'"
        color="primary"
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

// Use proxied avatar URL to bypass CORS issues with Google images
const proxiedAvatarUrl = computed(
  () => getProxiedAvatarUrl(props.user?.avatar) || '/placeholder-avatar.png'
)

const formattedJoinDate = computed(() => {
  if (!props.user?.created_at) return ''

  // Handle Firebase timestamp objects
  let date
  if (props.user.created_at.seconds) {
    // Firebase timestamp object
    date = new Date(props.user.created_at.seconds * 1000)
  } else if (props.user.created_at.toDate) {
    // Firebase timestamp method
    date = props.user.created_at.toDate()
  } else {
    // Regular date string/number
    date = new Date(props.user.created_at)
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
})

// Computed property for display name with fallback logic
const displayName = computed(() => {
  // Priority: display_name -> displayName -> email (without @domain)
  if (
    props.user?.display_name &&
    props.user.display_name !== props.user?.email
  ) {
    return props.user.display_name
  }
  if (props.user?.displayName && props.user.displayName !== props.user?.email) {
    return props.user.displayName
  }
  if (props.user?.email) {
    return props.user.email.split('@')[0] // Just username part
  }
  return 'Unknown User'
})
</script>

<style scoped>
.user-summary {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.avatar {
  flex-shrink: 0;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.15rem;
}

.handle {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.status,
.specialities,
.joined {
  font-size: 0.85rem;
  color: var(--text-secondary);
}
</style>
