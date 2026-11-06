<template>
  <UCard v-if="integrations" variant="subtle">
    <template #header>
      <h2 class="fx-type-section-title">Integrations</h2>
    </template>

    <div class="fx-card-body-stack">
      <p class="fx-type-caption">
        {{ integrations.body }}
      </p>

      <div
        v-if="integrations.consumers?.length"
        class="grid gap-3 md:grid-cols-3"
      >
        <UCard v-for="consumer in integrations.consumers" :key="consumer.name">
          <div class="flex items-center gap-2">
            <UIcon :name="consumer.icon" />
            <h3 class="fx-type-card-heading">
              {{ consumer.name }}
            </h3>
          </div>
          <p class="mt-2 fx-type-caption">
            {{ consumer.useGoQr }}
          </p>
          <p class="mt-2 fx-type-caption">
            {{ consumer.useApp }}
          </p>
          <UButton
            :to="consumer.to"
            :target="consumer.external ? '_blank' : undefined"
            :external="consumer.external"
            color="neutral"
            variant="ghost"
            size="xs"
            trailing-icon="i-lucide-arrow-up-right"
          >
            {{ consumer.cta }}
          </UButton>
        </UCard>
      </div>

      <div v-if="integrations.links?.length" class="fx-card__actions">
        <UButton
          v-for="link in integrations.links"
          :key="link.to"
          :to="link.to"
          color="neutral"
          variant="soft"
          size="sm"
        >
          {{ link.label }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  integrations?: {
    body: string
    links?: {
      label: string
      to: string
    }[]
    consumers?: {
      name: string
      icon: string
      to: string
      cta: string
      useGoQr: string
      useApp: string
      external?: boolean
    }[]
  }
}>()
</script>
