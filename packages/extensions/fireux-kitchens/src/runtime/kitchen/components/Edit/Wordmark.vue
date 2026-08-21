<template>
  <MoleculesDisclosurePanel
    title="Wordmark"
    description="Kitchen-owned kiosk and brand wordmarks."
    icon="i-lucide-type"
  >
    <div class="mt-4 space-y-4">
      <UCard>
        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium text-highlighted">Wordmark</p>
            <p class="text-xs text-dimmed">
              Current Kitchen wordmark. Recommended: 1600 × 400 px, transparent
              PNG.
            </p>
          </div>

          <div
            class="mx-auto flex aspect-[4/1] w-full max-w-xl items-center justify-center rounded-lg border border-default p-3"
            :style="{ backgroundColor: mediaBackdropColor || undefined }"
          >
            <img
              v-if="kioskWordmarkImageUrl"
              class="size-full object-contain"
              :src="kioskWordmarkImageUrl"
              :alt="`${name || 'Kitchen'} wordmark`"
            />
            <p v-else class="text-center text-xs text-dimmed">1600 × 400</p>
          </div>

          <input
            ref="wordmarkInput"
            class="hidden"
            type="file"
            accept="image/*"
            @change="handleWordmarkFileChange"
          />

          <div class="flex flex-wrap gap-2">
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              icon="i-lucide-upload"
              :disabled="!canWrite || pending"
              :loading="pending"
              @click="openWordmarkUpload"
            >
              Upload wordmark
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, ref } from 'vue'
import { useKitchenWordmarkUpdate } from '../../composables/firestore/mutations/useKitchenWordmarkUpdate'
import { readKitchenIdentity } from '../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const toast = useToastify()
const { pending, uploadKitchenWordmark } = useKitchenWordmarkUpdate()
const wordmarkInput = ref<HTMLInputElement | null>(null)

const identity = computed(() => readKitchenIdentity(props.kitchen))
const name = computed(() => identity.value.displayName)
const kioskWordmarkImageUrl = computed(
  () => identity.value.wordmarkNoLogoImageUrl || identity.value.wordmarkImageUrl
)
const mediaBackdropColor = computed(
  () =>
    identity.value.mediaBackdropColor ||
    String((props.kitchen as any)?.media_backdrop_color || '').trim()
)

const openWordmarkUpload = () => {
  if (!props.canWrite || pending.value) return
  wordmarkInput.value?.click()
}

const handleWordmarkFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (input) input.value = ''
  if (!file) return
  if (!props.canWrite) {
    toast.error('This Kitchen is read-only.')
    return
  }

  try {
    await uploadKitchenWordmark(props.kitchenId, file)
    toast.add({
      title: 'Wordmark updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    toast.add({
      title: 'Failed to update wordmark',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  }
}
</script>
