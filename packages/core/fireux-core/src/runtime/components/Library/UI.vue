<template>
  <div class="p-6 space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold">Nuxt UI 4 demo</h1>
      <p class="text-sm opacity-70">
        Quick sanity check for @nuxt/ui v4 components.
      </p>
    </div>

    <div class="flex items-center gap-3">
      <UButton color="primary">Primary</UButton>
      <UButton color="neutral" variant="soft">Neutral</UButton>
      <UButton
        color="primary"
        variant="outline"
        icon="i-heroicons-sparkles-20-solid"
        >Icon</UButton
      >
    </div>

    <UCard>
      <template #header>
        <div class="font-medium">Card header</div>
      </template>
      <div class="space-y-4">
        <UInput v-model="name" placeholder="Your name" />
        <USelect
          v-model="flavor"
          :items="flavors"
          placeholder="Pick a flavor"
        />
        <div class="text-sm opacity-70">
          Hello, {{ name || '—' }}. Flavor: {{ flavor || '—' }}
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'


const name = ref('')
const flavor = ref<string | undefined>(undefined)
const flavors = [
  { label: 'Vanilla', value: 'vanilla' },
  { label: 'Chocolate', value: 'chocolate' },
  { label: 'Strawberry', value: 'strawberry' },
]
</script>
