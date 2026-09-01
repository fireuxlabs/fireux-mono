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
          :to="`/workspace/kitchen/${encodeURIComponent(kitchen.id)}`"
          color="neutral"
          variant="soft"
          block
          class="justify-start"
          @click="emit('update:open', false)"
        >
          <UAvatar
            :src="kitchen.image || undefined"
            :alt="kitchen.name"
            icon="i-lucide-chef-hat"
            size="md"
          />
          <span class="min-w-0 text-left">
            <span class="block truncate font-medium">{{ kitchen.name }}</span>
            <span
              v-if="kitchen.description"
              class="block truncate text-xs text-muted"
            >
              {{ kitchen.description }}
            </span>
          </span>
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import type { KitchenWorkspaceIndexState } from '../../../composables/workspace/index/useKitchenWorkspaceIndex'

const props = defineProps<{
  open: boolean
  state: KitchenWorkspaceIndexState
}>()
const emit = defineEmits<{ (event: 'update:open', open: boolean): void }>()
const workspace = useWorkspace('kitchen')
const kitchens = computed(() => {
  const available = workspace.choices.value.filter((kitchen: { id: string }) =>
    props.state.appUser.kitchens.includes(kitchen.id)
  )
  if (available.length) return available
  return props.state.kitchen.id
    ? [
        {
          id: props.state.kitchen.id,
          name: props.state.kitchen.name || props.state.kitchen.id,
          description: props.state.kitchen.tagline,
          image: props.state.kitchen.url,
        },
      ]
    : []
})
</script>
