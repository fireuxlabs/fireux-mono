<template>
  <button type="button" class="pill justify-start text-left" @click="emit('select')">
    <div class="flex w-full min-w-0 items-center gap-2">
      <div
        v-if="loading && !imageUrl"
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed text-muted"
      >
        <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin" />
      </div>
      <UAvatar v-else :src="imageUrl || undefined" :alt="name || ''" size="xs" />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium">
          {{ name }}
        </p>
        <p v-if="address" class="truncate text-xs text-muted">
          {{ address }}
        </p>
      </div>
      <UBadge v-if="showSource" variant="soft" color="neutral" size="xs">
        Google
      </UBadge>
    </div>
  </button>
</template>

<script setup lang="ts">
type Props = {
  name: string
  address: string
  imageUrl?: string
  showSource?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  imageUrl: '',
  showSource: false,
  loading: false,
})

const emit = defineEmits<{
  (e: 'select'): void
}>()
</script>
