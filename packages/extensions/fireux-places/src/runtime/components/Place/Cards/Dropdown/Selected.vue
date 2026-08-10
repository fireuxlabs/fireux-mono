<template>
  <div class="pill justify-start text-left">
    <div class="flex w-full min-w-0 items-center gap-2">
      <div
        v-if="loading && !imageUrl"
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-dashed text-muted"
      >
        <UIcon name="i-lucide-loader-2" class="h-3 w-3 animate-spin" />
      </div>
      <UAvatar
        v-else
        :src="imageUrl || undefined"
        :alt="name || ''"
        size="xs"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium">
          {{ name }}
        </p>
        <p v-if="address" class="truncate text-xs text-muted">
          {{ address }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlaceSource } from '../../../../models/place.model'

type Props = {
  name: string
  address: string
  imageUrl?: string
  source?: PlaceSource
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: '',
  loading: false,
})

</script>
