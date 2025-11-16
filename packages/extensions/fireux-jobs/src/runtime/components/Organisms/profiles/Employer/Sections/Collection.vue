<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between gap-2">
        <h2>{{ title }}</h2>
        <UBadge variant="soft">{{ total }} total</UBadge>
      </div>
      <p v-if="description" class="text-sm opacity-70">
        {{ description }}
      </p>
    </template>

    <p class="text-sm opacity-70">
      Employer directory scaffolding will live here once the data contract is
      ready.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ title?: string; description?: string }>(),
  {
    title: 'Employer Directory',
    description: '',
  }
)

const total = computed(() => 0)
const title = computed(() => props.title)
const description = computed(() => props.description)
</script>
