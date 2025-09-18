<template>
  <UCard class="pill">
    <div class="pill-inner">
      <UAvatar :src="appUser.avatar" :alt="appUser.display_name" size="sm" />
      <div class="meta">
        <div class="name">{{ appUser.display_name }}</div>
      </div>
      <UBadge
        v-if="appUser.role"
        size="xs"
        class="pill-role"
        variant="soft"
        :color="appUser.role === 'admin' ? 'primary' : 'neutral'"
      >
        {{ appUser.role }}
      </UBadge>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppUserPillProps } from '../../../../../models/core/appUser.model'

defineProps<{ appUser: AppUserPillProps }>()
</script>
