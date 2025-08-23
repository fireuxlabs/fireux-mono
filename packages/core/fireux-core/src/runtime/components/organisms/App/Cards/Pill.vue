<template>
  <UCard class="pill">
    <div class="pill-content">
      <UAvatar :src="app?.avatarUrl" :alt="app?.app_name" size="sm" />

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
import type { App } from '../../../../models/core/app.model'

interface Props {
  app: App.Card.Pill
}

defineProps<Props>()
</script>
