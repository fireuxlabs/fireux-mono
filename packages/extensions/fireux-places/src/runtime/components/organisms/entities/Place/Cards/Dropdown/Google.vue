<template>
  <button type="button" class="pill justify-start text-left" @click="emit('select')">
    <div class="flex w-full min-w-0 items-center gap-2">
      <UAvatar :src="imageUrl || undefined" :alt="name || ''" size="xs" />
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
}

withDefaults(defineProps<Props>(), {
  imageUrl: '',
  showSource: true,
})

const emit = defineEmits<{
  (e: 'select'): void
}>()
</script>
