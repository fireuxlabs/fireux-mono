<template>
  <section aria-label="Kitchen selector">
    <UTabs
      v-if="canSelectMultiple"
      :model-value="selectedKitchenId"
      :items="items"
      :content="false"
      variant="link"
      size="sm"
      class="w-fit max-w-full"
      @update:model-value="selectKitchen"
    />

    <div v-else class="flex flex-wrap items-center gap-3 py-2">
      <UIcon name="i-lucide-refresh-cw" class="size-5 shrink-0 text-muted" />
      <div class="min-w-48 flex-1">
        <p class="m-0 text-sm font-medium text-highlighted">
          Change primary Kitchen
        </p>
        <p class="m-0 text-xs text-muted">
          Choose a Kitchen for admin approval.
        </p>
      </div>
      <UFormField label="Kitchen" class="min-w-56">
        <USelect
          v-model="requestedKitchenId"
          :items="requestItems"
          value-key="value"
          placeholder="Select a Kitchen"
          class="w-full"
        />
      </UFormField>
      <UButton
        label="Request change"
        icon="i-lucide-send"
        :loading="requesting"
        :disabled="!requestedKitchenId"
        @click="requestChange"
      />
      <UButton
        label="Upgrade to Business"
        to="/pricing/business"
        variant="link"
        trailing-icon="i-lucide-arrow-up-right"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { KitchenWorkspaceIndexState } from '../../composables/workspace/index/useKitchenWorkspaceIndex'
import { useKitchenWorkspaceSelection } from '../../composables/workspace/core/useKitchenWorkspaceSelection'

const props = defineProps<{
  kitchens: KitchenWorkspaceIndexState['kitchens']
  selectedKitchenId: string
  primaryKitchenId: string
  canSelectMultiple: boolean
}>()

const { setKitchenWorkspaceSelection } = useKitchenWorkspaceSelection()
const { currentUser } = useAuth()
const toast = useToast()
const requestedKitchenId = ref('')
const requesting = ref(false)
const items = computed(() =>
  props.kitchens.map((kitchen) => ({
    label: kitchen.name,
    value: kitchen.id,
    avatar: {
      src: kitchen.url || undefined,
      alt: kitchen.name,
      icon: 'i-lucide-chef-hat',
    },
  }))
)
const requestItems = computed(() =>
  props.kitchens
    .filter((kitchen) => kitchen.id !== props.primaryKitchenId)
    .map((kitchen) => ({
      label: kitchen.name,
      value: kitchen.id,
      avatar: {
        src: kitchen.url || undefined,
        alt: kitchen.name,
        icon: 'i-lucide-chef-hat',
      },
    }))
)

function selectKitchen(kitchenId: string | number) {
  const kitchen = props.kitchens.find((item) => item.id === kitchenId)
  if (!kitchen) return
  setKitchenWorkspaceSelection({
    kitchenId: kitchen.id,
    name: kitchen.name,
    tagline: kitchen.tagline,
    url: kitchen.url,
  })
}

async function requestChange() {
  const user = currentUser.value
  if (!user || !requestedKitchenId.value) return
  requesting.value = true
  try {
    await $fetch('/api/workspace/kitchen/request-primary-change', {
      method: 'POST',
      headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      body: { kitchenId: requestedKitchenId.value },
    })
    requestedKitchenId.value = ''
    toast.add({
      title: 'Primary Kitchen change requested',
      description: 'An admin has been notified.',
      color: 'success',
    })
  } catch {
    toast.add({
      title: 'Request not sent',
      description: 'Please try again.',
      color: 'error',
    })
  } finally {
    requesting.value = false
  }
}
</script>
