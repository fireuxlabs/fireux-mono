<template>
  <div>
    <div class="pagebody">
      <h1>Nuxt UI 4 demo</h1>
      <p>Quick sanity check for @nuxt/ui v4 components.</p>
    </div>

    <div class="fx-card__actions">
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
        <div>Card header</div>
      </template>
      <div class="fx-card-body-stack">
        <UInput v-model="name" placeholder="Your name" />
        <USelect
          v-model="flavor"
          :items="flavors"
          placeholder="Pick a flavor"
        />
        <div>Hello, {{ name || '—' }}. Flavor: {{ flavor || '—' }}</div>
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
