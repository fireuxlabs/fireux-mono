<template>
  <UPageGrid>
    <UPageCard
      title="Native controls"
      description="Nuxt UI works directly inside FireUX."
      variant="outline"
    >
      <UFormField label="Example name">
        <UInput v-model="name" placeholder="Name this example" />
      </UFormField>
      <USwitch v-model="enabled" label="Enable local preview" />
      <UBadge :color="enabled ? 'success' : 'neutral'" variant="subtle">
        {{ enabled ? name || 'Preview enabled' : 'Preview paused' }}
      </UBadge>
    </UPageCard>

    <UPageCard
      title="Composed interactions"
      description="FireUX adds a shared interaction around native controls."
      variant="outline"
    >
      <FireDisclosurePanel
        title="Explore the interaction"
        description="A shared disclosure pattern"
        icon="i-lucide-panel-top-open"
      >
        <p class="fx-type-description">
          The labelled trigger and content compose Nuxt UI's accessible
          collapsible behaviour.
        </p>
      </FireDisclosurePanel>
      <UButton
        label="Run local action"
        variant="soft"
        :disabled="!enabled"
        @click="count++"
      />
      <p class="fx-type-caption" role="status">
        {{
          count
            ? `Local action run ${count} ${count === 1 ? 'time' : 'times'}.`
            : 'This example stays in your browser.'
        }}
      </p>
    </UPageCard>

    <UPageCard
      title="Explicit states"
      description="Shared loading, empty, missing and error presentation."
      variant="outline"
    >
      <FireStateCard
        state="empty"
        surface="bare"
        title="Ready for your content"
        description="An empty-state example using the Core state pattern."
      />
    </UPageCard>
  </UPageGrid>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const name = ref('My FireUX App')
const enabled = ref(true)
const count = ref(0)
</script>
