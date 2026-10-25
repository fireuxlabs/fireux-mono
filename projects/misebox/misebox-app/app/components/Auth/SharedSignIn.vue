<template>
  <div v-if="enabled" class="space-y-2">
    <UButton
      block
      color="neutral"
      variant="outline"
      :loading="busy"
      :disabled="busy || disabled"
      label="Continue with FireUX"
      @click="start"
    >
      <template v-if="!busy" #leading>
        <img
          src="/img/core/brand/logo.svg"
          alt=""
          aria-hidden="true"
          class="size-5 shrink-0 object-contain"
          width="20"
          height="20"
        />
      </template>
    </UButton>
    <div v-if="error" role="alert">
      <UAlert
        variant="subtle"
        color="error"
        title="Shared sign-in is unavailable"
        :description="error"
      /><FireCopyError :message="error" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { watch } from 'vue'
defineProps<{ disabled?: boolean }>()
const emit = defineEmits<{ busy: [value: boolean] }>()
const enabled = useRuntimeConfig().public.sharedSignIn.enabled
const { start, busy, error } = useFireuxSignIn()
watch(busy, (value) => emit('busy', value), { flush: 'sync' })
</script>
