<template>
  <div class="profile-header">
    <UAvatar :src="avatar" :alt="name" :size="size" />
    <div class="profile-info">
      <p class="profile-name" :class="nameClass">{{ name }}</p>
      <p v-if="title" class="profile-subtitle">{{ title }}</p>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(
  defineProps<{
    avatar: string
    name: string
    title?: string | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  {
    size: 'md',
  }
)

const nameClass = computed(() => {
  switch (props.size) {
    case 'lg':
    case 'xl':
      return 'text-lg'
    case 'sm':
    case 'xs':
      return 'text-sm'
    default:
      return 'text-base'
  }
})
</script>

<style scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.profile-name {
  font-weight: 600;
}
.profile-subtitle {
  color: var(--ui-text-muted);
  font-size: 0.9rem;
}
</style>
