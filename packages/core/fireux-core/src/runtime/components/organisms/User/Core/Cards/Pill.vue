<template>
  <UCard class="pill">
    <div class="profile-display">
      <UAvatar
        :src="coreUser?.avatar"
        :alt="coreUser?.email || 'Core User'"
        size="sm"
      />
      <div class="profile-text">
        <h5 class="profile-name">{{ coreUser?.email || 'Core User' }}</h5>
        <p v-if="coreUser?.id" class="profile-email">{{ coreUser.id }}</p>
      </div>
    </div>

    <div v-if="coreUser?.adminOf?.length" class="profile-badges">
      <span
        v-for="app in coreUser.adminOf.slice(0, 2)"
        :key="app"
        class="badge"
      >
        Admin: {{ app }}
      </span>
      <span v-if="coreUser.adminOf.length > 2" class="badge-more">
        +{{ coreUser.adminOf.length - 2 }}
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { CoreUser } from '../../../../../models/core/coreUser.model'

defineProps<{
  coreUser?: Partial<CoreUser>
}>()
</script>
