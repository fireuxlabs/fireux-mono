<template>
  <UCard>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <UAvatar
        :src="model.imageUrl || undefined"
        :alt="model.title"
        icon="i-lucide-chef-hat"
        size="3xl"
      />

      <div class="min-w-0 flex-1 space-y-3">
        <div class="space-y-1">
          <div class="fx-type-label">Kitchen</div>

          <h2 class="text-2xl font-semibold text-highlighted">
            {{ model.title }}
          </h2>
          <p v-if="model.subtitle" class="max-w-3xl text-sm text-toned">
            {{ model.subtitle }}
          </p>
        </div>

        <div v-if="model.badges.length" class="flex flex-wrap gap-2">
          <UBadge
            v-for="badge in model.badges"
            :key="badge"
            color="neutral"
            variant="soft"
          >
            {{ badge }}
          </UBadge>
        </div>

        <div
          v-if="model.foodGallery.length"
          class="flex gap-2 overflow-x-auto pb-1"
        >
          <img
            v-for="image in model.foodGallery"
            :key="image"
            :src="image"
            :alt="model.title || 'Food gallery image'"
            class="size-20 shrink-0 rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { KitchenCard } from '../../models/kitchen-interface.model'

defineProps<{ model: KitchenCard.Profile }>()
</script>
