<template>
  <UModal
    :open="open"
    title="Read Kitchens"
    description="Choose a Kitchen to open its detail page."
    :ui="{ content: 'sm:max-w-lg' }"
    @update:open="emit('update:open', $event)"
  >
    <template #body>
      <div class="grid gap-2">
        <UButton
          v-for="kitchen in kitchens"
          :key="kitchen.id"
          :to="`/workspace/kitchen/${encodeURIComponent(kitchen.id || '')}`"
          color="neutral"
          variant="soft"
          block
          class="justify-start"
          @click="emit('update:open', false)"
        >
          <UAvatar
            :src="kitchen.display_image_url || undefined"
            :alt="kitchen.display_name"
            icon="i-lucide-chef-hat"
            size="md"
          />
          <span class="min-w-0 text-left">
            <span class="block truncate font-medium">{{ kitchen.display_name }}</span>
            <span
              v-if="kitchen.tagline"
              class="block truncate text-xs text-muted"
            >
              {{ kitchen.tagline }}
            </span>
          </span>
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenWorkspaceIndex } from '../../../composables/workspace/index/useKitchenWorkspaceIndex'
defineProps<{ open: boolean }>()
const emit = defineEmits<{ (event: 'update:open', open: boolean): void }>()
const workspaceIndex = useKitchenWorkspaceIndex()
const kitchens = computed(() => {
  return workspaceIndex.collection.value
})
</script>
