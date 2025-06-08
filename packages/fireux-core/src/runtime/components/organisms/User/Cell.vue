<template>
  <div class="user-cell">
    <UAvatar :src="props.user.avatar" size="lg" />
    <div class="info">
      <strong class="name">{{ props.user.display_name }}</strong>
      <span class="handle">@{{ props.user.handle }}</span>
      <UBadge v-if="props.user?.isAdmin" variant="subtle" class="badge"
        >Admin</UBadge
      >
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
})
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
