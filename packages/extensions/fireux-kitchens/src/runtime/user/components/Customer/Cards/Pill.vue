<template>
  <div class="pill">
    <UUser :name="displayName" :description="title || undefined" size="sm">
      <template #avatar>
        <UAvatarGroup v-if="avatarUrl && secondaryAvatarUrl" size="xs">
          <UAvatar
            :src="avatarUrl || undefined"
            :alt="displayName || ''"
            size="xs"
          />
          <UAvatar
            :src="secondaryAvatarUrl || undefined"
            :alt="displayName || ''"
            size="2xs"
          />
        </UAvatarGroup>
        <UAvatar
          v-else
          :src="avatarUrl || undefined"
          :alt="displayName || ''"
          size="xs"
        />
      </template>
    </UUser>
  </div>
</template>

<script setup lang="ts">
import type { CustomerCard } from '../../../composables/customer/useCustomerInterface'

defineProps<
  Pick<
    CustomerCard.Card,
    'avatarUrl' | 'secondaryAvatarUrl' | 'displayName' | 'title'
  >
>()
</script>
