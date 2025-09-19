<template>
  <UCard class="cell">
    <div class="cell-inner">
      <UAvatar :src="appUser.avatar" :alt="appUser.display_name" size="md" />
      <div class="meta">
        <div class="name">{{ appUser.display_name }}</div>

        <div v-if="appUser.profiles?.length" class="cell-badges">
          <UBadge
            v-for="p in appUser.profiles"
            :key="p"
            size="xs"
            variant="soft"
          >
            {{ p }}
          </UBadge>
        </div>
      </div>
      <UBadge
        v-if="appUser.role"
        size="xs"
        class="cell-role"
        variant="soft"
        :color="appUser.role === 'admin' ? 'primary' : 'neutral'"
      >
        {{ appUser.role }}
      </UBadge>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type AppUserLike = {
  id?: string
  display_name?: string
  avatar?: string
  handle?: string
  role?: 'user' | 'admin'
  profiles?: string[]
}

const props = defineProps<{
  appUser?: AppUserLike
  user?: AppUserLike
}>()
const appUser = computed(() => (props.appUser ?? props.user) as AppUserLike)
</script>
