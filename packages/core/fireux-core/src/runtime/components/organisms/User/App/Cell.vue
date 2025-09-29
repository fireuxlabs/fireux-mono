<template>
  <div class="user-cell">
    <div class="user-avatar">
      <UAvatar
        :src="user.avatar"
        :alt="user.display_name"
        :text="initials"
        size="md"
      />
    </div>
    <div class="user-info">
      <h3 class="user-name">
        {{ user.display_name || user.email }}
        <UBadge v-if="user.role" size="xs" variant="subtle" class="ml-2">{{
          user.role
        }}</UBadge>
      </h3>
    </div>
  </div>
</template>

<script setup>import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const initials = computed(() => {
  const name =
    props.user?.display_name || props.user?.full_name || props.user?.email || ''
  const parts = String(name).trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase()
})
</script>

<style scoped>
.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.5rem;
  background: var(--ui-bg);
}

.user-avatar :deep(img),
.user-avatar :deep(.avatar-fallback) {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.user-email {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}
</style>
