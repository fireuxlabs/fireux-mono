<template>
  <UApp>
    <UPage>
      <UContainer>
        <div class="pagebody">
          <div class="pagebody">
            <p class="fx-type-caption">Go QR</p>
            <h1 class="fx-type-page-title">
              {{ title }}
            </h1>
            <p class="fx-type-body">
              {{ description }}
            </p>
          </div>

          <UButton to="/" icon="i-lucide-arrow-left" variant="soft">
            Back to Go QR
          </UButton>
        </div>
      </UContainer>
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

const title = computed(() =>
  props.error.statusCode
    ? `Error ${props.error.statusCode}`
    : 'Something went wrong'
)
const description = computed(
  () =>
    props.error.statusMessage ||
    props.error.message ||
    'The page could not be loaded.'
)
</script>
