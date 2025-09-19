<template>
  <UCard class="pill">
    <div class="pill-inner">
      <UAvatar :src="chef.avatar" :alt="chef.display_name" size="sm" />
      <div class="meta">
        <div class="name">{{ chef.display_name }}</div>
        <div v-if="chef.title" class="title">{{ chef.title }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ChefCard } from '../../../../../models/profiles/Chef.model'

defineProps<{ chef: ChefCard.Pill }>()
</script>
