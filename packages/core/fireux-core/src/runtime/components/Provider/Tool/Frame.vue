<template>
  <UCard variant="subtle">
    <div class="fx-card-body-stack">
      <a
        :href="providerUrl"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center gap-2"
      >
        <AppBrandLogo
          size="small"
          :alt="logoAlt || providerName"
          class="size-4"
        />
        <span>Powered by {{ providerName }}</span>
      </a>

      <header v-if="title || description" class="space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <h2 v-if="title">
            {{ title }}
          </h2>
          <UBadge
            v-if="endpoint"
            :label="endpoint"
            color="neutral"
            variant="soft"
          />
        </div>
        <p v-if="description">
          {{ description }}
        </p>
      </header>

      <slot />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  providerName: string
  providerUrl: string
  logoAlt?: string
  title?: string
  description?: string
  endpoint?: string
}>()
</script>
