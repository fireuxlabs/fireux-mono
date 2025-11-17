<template>
  <UCard
    class="space-y-3 rounded-xl border border-gray-100 p-4 shadow-sm dark:border-gray-800"
  >
    <div class="flex items-center gap-3">
      <UAvatar
        :src="props.professional.avatar"
        :alt="props.professional.title || 'Professional'"
        :text="props.professional.initials"
        size="md"
      />
      <div class="flex flex-col gap-1">
        <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ props.professional.title || 'Professional' }}
        </h4>
        <p
          v-if="props.professional.subtitle"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          {{ props.professional.subtitle }}
        </p>
      </div>
    </div>

    <p
      v-if="props.professional.bio_short"
      class="text-sm text-gray-600 dark:text-gray-300"
    >
      {{ props.professional.bio_short }}
    </p>

    <div
      v-if="props.professional.specialties?.length"
      class="flex flex-wrap gap-2"
    >
      <span
        v-for="(tag, i) in props.professional.specialties.slice(0, 3)"
        :key="tag + i"
        class="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
      >
        {{ tag }}
      </span>
      <span
        v-if="props.professional.specialties.length > 3"
        class="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200"
      >
        +{{ props.professional.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../models/profiles/Professional.model'

const props = defineProps<{ professional: ProfessionalCard.Cell }>()
</script>
