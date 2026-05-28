<template>
  <slot
    v-if="tool"
    :tool="tool"
  />

  <UCard
    v-else-if="pending"
    variant="subtle"
  >
    <div class="space-y-3">
      <USkeleton class="h-5 w-2/3" />
      <USkeleton class="h-32 w-full" />
      <USkeleton class="h-10 w-full" />
    </div>
  </UCard>

  <UAlert
    v-else
    color="error"
    variant="soft"
    icon="i-lucide-circle-alert"
    :title="`${name} tool unavailable`"
    :description="error?.message || `The Go QR ${name.toLowerCase()} tool could not be loaded.`"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type GoQrAnyToolContract } from '../../../utils/goQrProviderClient'

const props = defineProps<{
  toolId: string
  name: string
}>()

const key = computed(() => `go-qr-${props.toolId}-tool`)
const endpoint = computed(() => `/api/tools/${props.toolId}`)

const { data: tool, error, pending } = useAsyncData<GoQrAnyToolContract>(
  key.value,
  () => $fetch(endpoint.value)
)
</script>
