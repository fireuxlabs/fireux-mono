<template>
  <UCard variant="subtle">
    <div class="fx-card-body-stack">
      <a :href="providerUrl" target="_blank" rel="noopener">
        <AppBrandLogo size="small" :alt="logoAlt || providerName" />
        <span>Powered by {{ providerName }}</span>
      </a>

      <header v-if="title || description">
        <div>
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
