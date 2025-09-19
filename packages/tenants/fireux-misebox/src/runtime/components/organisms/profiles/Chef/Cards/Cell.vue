<template>
  <UCard class="cell">
    <div class="cell-inner">
      <UAvatar :src="chef.avatar" :alt="chef.display_name" size="md" />
      <div class="meta">
        <div class="name">{{ chef.display_name }}</div>
        <div v-if="chef.title" class="title">{{ chef.title }}</div>
        <div v-if="chef.bioShort" class="subtitle">{{ chef.bioShort }}</div>
        <div v-if="chef.specialties?.length" class="cell-badges">
          <UBadge
            v-for="s in chef.specialties"
            :key="s"
            size="xs"
            variant="soft"
          >
            {{ s }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ChefCard } from '../../../../../models/profiles/Chef.model'

defineProps<{ chef: ChefCard.Cell }>()
</script>
