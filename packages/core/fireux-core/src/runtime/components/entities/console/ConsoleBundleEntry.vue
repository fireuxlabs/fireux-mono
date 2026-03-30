<template>
  <div class="rounded-xl border border-default bg-default/40 p-3 sm:p-4">
    <div class="flex items-center gap-3">
      <UAvatar
        v-if="imageUrl"
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="md"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-semibold text-highlighted">
          {{ title }}
        </p>
        <p v-if="subtitle" class="truncate text-xs text-dimmed">
          {{ subtitle }}
        </p>
      </div>
    </div>

    <div v-if="previewItems.length" class="mt-3 flex flex-wrap gap-2">
      <div
        v-for="item in previewItems"
        :key="item.title"
        class="inline-flex items-center gap-2 rounded-full border border-default bg-default px-2.5 py-1"
      >
        <UAvatar
          v-if="item.imageUrl"
          :src="item.imageUrl || undefined"
          :alt="item.title"
          size="xs"
        />
        <span class="max-w-36 truncate text-xs text-toned">
          {{ item.title }}
        </span>
      </div>
    </div>

    <div class="mt-3 flex flex-wrap gap-2">
      <UButton
        color="primary"
        variant="soft"
        size="sm"
        icon="i-lucide-arrow-right"
        @click="$emit('action')"
      >
        {{ actionLabel }}
      </UButton>

      <UButton
        v-if="secondaryActionLabel"
        color="neutral"
        variant="soft"
        size="sm"
        icon="i-lucide-plus"
        @click="$emit('secondaryAction')"
      >
        {{ secondaryActionLabel }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle?: string
  imageUrl?: string
  actionLabel?: string
  secondaryActionLabel?: string
  previewItems?: Array<{
    title: string
    imageUrl?: string
  }>
}>(), {
  subtitle: '',
  imageUrl: '',
  actionLabel: 'Enter',
  secondaryActionLabel: '',
  previewItems: () => [],
})

defineEmits<{
  (event: 'action'): void
  (event: 'secondaryAction'): void
}>()
</script>
