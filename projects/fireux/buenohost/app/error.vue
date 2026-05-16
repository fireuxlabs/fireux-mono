<template>
  <UApp>
    <UPage>
      <UPageHeader
        :title="title"
        :description="description"
      />
      <UPageBody>
        <UButton to="/" icon="i-lucide-arrow-left" variant="soft">
          Back to BuenoHost
        </UButton>
      </UPageBody>
    </UPage>
  </UApp>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  error: {
    statusCode?: number
    statusMessage?: string
    message?: string
  }
}>()

const title = computed(() => props.error.statusCode ? `Error ${props.error.statusCode}` : 'Something went wrong')
const description = computed(() => props.error.statusMessage || props.error.message || 'The page could not be loaded.')
</script>
