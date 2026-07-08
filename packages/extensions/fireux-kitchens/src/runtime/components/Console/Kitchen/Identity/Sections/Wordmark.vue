<template>
  <UCollapsible>
    <UButton
      class="group"
      color="neutral"
      variant="soft"
      block
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon:
          'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
    >
      <span class="flex min-w-0 items-start gap-3 text-left">
        <UIcon
          name="i-lucide-type"
          class="mt-0.5 size-4 shrink-0 text-muted"
        />
        <span class="grid min-w-0">
          <span class="truncate">Wordmark</span>
          <span class="truncate text-xs font-normal text-dimmed">
            Kitchen-owned kiosk and brand wordmarks.
          </span>
        </span>
      </span>
    </UButton>

    <template #content>
      <div class="mt-4 space-y-4">
        <UCard>
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-highlighted">
                Kiosk wordmark
              </p>
              <p class="text-xs text-dimmed">
                Kiosk uses the no-logo wordmark first, then the standard wordmark.
              </p>
            </div>

            <div class="rounded-lg border border-default bg-muted p-3">
              <img
                v-if="kioskWordmarkImageUrl"
                class="mx-auto max-h-16 w-full max-w-sm object-contain"
                :src="kioskWordmarkImageUrl"
                :alt="`${name || 'Kitchen'} wordmark`"
              >
              <p
                v-else
                class="text-center text-xs text-dimmed"
              >
                No kiosk wordmark yet.
              </p>
            </div>

            <input
              ref="wordmarkInput"
              class="hidden"
              type="file"
              accept="image/*"
              @change="handleWordmarkFileChange"
            >

            <div class="flex flex-wrap gap-2">
              <UButton
                size="sm"
                color="neutral"
                variant="soft"
                icon="i-lucide-upload"
                :disabled="!canWrite || pending"
                :loading="pending && wordmarkUploadKind === 'no-logo'"
                @click="openWordmarkUpload('no-logo')"
              >
                No-logo wordmark
              </UButton>

              <UButton
                size="sm"
                color="neutral"
                variant="soft"
                icon="i-lucide-upload"
                :disabled="!canWrite || pending"
                :loading="pending && wordmarkUploadKind === 'standard'"
                @click="openWordmarkUpload('standard')"
              >
                Wordmark
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref } from 'vue'
import {
  useKitchenWordmarkUpdate,
  type KitchenWordmarkKind,
} from '../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenWordmarkUpdate'
import { readKitchenIdentity } from '../../../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  collectionPath: string
  canWrite: boolean
}>()

const collectionPath = computed(() => props.collectionPath)
const toast = useToastify()
const { pending, uploadKitchenWordmark } = useKitchenWordmarkUpdate({
  collectionPath,
})
const wordmarkInput = ref<HTMLInputElement | null>(null)
const wordmarkUploadKind = ref<KitchenWordmarkKind>('no-logo')

const identity = computed(() => readKitchenIdentity(props.kitchen))
const name = computed(() => identity.value.displayName)
const kioskWordmarkImageUrl = computed(() =>
  identity.value.wordmarkNoLogoImageUrl || identity.value.wordmarkImageUrl
)

const openWordmarkUpload = (kind: KitchenWordmarkKind) => {
  wordmarkUploadKind.value = kind
  wordmarkInput.value?.click()
}

const handleWordmarkFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (input) input.value = ''
  if (!file) return

  try {
    await uploadKitchenWordmark(
      props.kitchenId,
      file,
      wordmarkUploadKind.value
    )
    toast.add({
      title:
        wordmarkUploadKind.value === 'no-logo'
          ? 'Kiosk wordmark updated'
          : 'Wordmark updated',
      icon: 'i-heroicons-check-circle',
    })
  } catch (error) {
    toast.add({
      title: 'Failed to update wordmark',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
  }
}
</script>
