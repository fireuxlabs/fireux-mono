<template>
  <UCard class="pill">
    <div class="pill-inner">
      <UAvatar :src="chef.avatar" :alt="chef.name" size="sm" />
      <div class="meta">
        <div class="name">{{ chef.name }}</div>
        <div v-if="chef.title" class="title">{{ chef.title }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ChefPillProps } from '../../../../../models/profiles/Chef.model'

defineProps<{ chef: ChefPillProps }>()
</script>
