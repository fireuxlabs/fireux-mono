<template>
  <ProviderToolFrame
    provider-name="Sproochli"
    provider-url="https://sproochli.web.app"
    logo-alt="Sproochli"
    :title="title"
    :description="description"
    :endpoint="endpoint"
  >
    <slot />
  </ProviderToolFrame>
</template>

<script setup lang="ts">
import ProviderToolFrame from 'fireux-core/runtime/components/Provider/Tool/Frame.vue'

defineProps<{
  title?: string
  description?: string
  endpoint?: string
}>()
</script>
