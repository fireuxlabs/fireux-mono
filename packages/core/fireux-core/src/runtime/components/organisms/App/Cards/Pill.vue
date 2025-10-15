<template>
  <UCard class="pill">
    <div class="pill-content">
      <UAvatar
        :src="app?.avatar_url ?? app?.avatarUrl ?? undefined"
        :alt="app?.app_name"
        size="sm"
      />

      <div class="pill-info">
        <div class="pill-title">
          {{ app?.app_name }}
        </div>
        <UBadge
          v-if="app?.parent"
          icon="i-lucide-building"
          size="md"
          color="primary"
          variant="solid"
        >
          {{ app.parent }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../models/core/app.model'

interface Props {
  app: AppCard.Pill
}

defineProps<Props>()
</script>
