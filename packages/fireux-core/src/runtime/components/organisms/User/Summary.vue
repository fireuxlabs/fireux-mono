<template>
  <div class="user-summary">
    <UAvatar :src="proxiedAvatarUrl" size="lg" class="avatar" />
    <div class="info">
      <strong class="name">{{ props.user.display_name }}</strong>
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
        v-if="props.user?.isAdmin"
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
  const date = new Date(props.user.created_at)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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
