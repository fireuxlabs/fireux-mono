<template>
  <div>
    <WorkspaceCrudToolbar
      label="Kitchen"
      :available="available"
      @create="createOpen = true"
      @read="readOpen = true"
      @update="openUpdate"
    />

    <WorkspaceKitchenCrudCreate v-model:open="createOpen" />
    <WorkspaceKitchenCrudRead v-model:open="readOpen" :state="state" />
    <UModal
      v-model:open="updateOpen"
      title="Edit Kitchen"
      description="Update the selected Kitchen root without replacing Place-owned identity."
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <form class="space-y-5" @submit.prevent="saveKitchen">
          <UFormField label="Slug" :error="updateError || undefined">
            <UInput v-model="slug" maxlength="80" autofocus class="w-full" />
          </UFormField>
          <UFormField label="Status">
            <USelect v-model="status" :items="statusItems" class="w-full" />
          </UFormField>
          <UFormField label="Publicly visible">
            <USwitch v-model="visibility" />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              type="button"
              @click="updateOpen = false"
            />
            <UButton label="Save changes" type="submit" :loading="saving" />
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import WorkspaceKitchenCrudRead from './Crud/Read.vue'
import type {
  KitchenWorkspaceIndexDerived,
  KitchenWorkspaceIndexState,
  useKitchenWorkspaceIndex,
} from '../../composables/workspace/index/useKitchenWorkspaceIndex'

type Workspace = ReturnType<typeof useKitchenWorkspaceIndex>

const props = defineProps<{
  state: KitchenWorkspaceIndexState
  derived: KitchenWorkspaceIndexDerived
  primitives: Workspace['primitives']
}>()

const createOpen = ref(false)
const readOpen = ref(false)
const updateOpen = ref(false)
const slug = ref('')
const status = ref<'active' | 'inactive' | 'archived'>('inactive')
const visibility = ref(false)
const updateError = ref('')
const saving = ref(false)
const statusItems = ['active', 'inactive', 'archived']
const available = computed(() => props.derived.capability.availableActions)

function openUpdate() {
  slug.value = props.state.kitchen.slug
  status.value = props.state.kitchen.status
  visibility.value = props.state.kitchen.visibility
  updateError.value = ''
  updateOpen.value = true
}

async function saveKitchen() {
  const normalizedSlug = slug.value.trim()
  if (!normalizedSlug) {
    updateError.value = 'Enter a Kitchen slug.'
    return
  }
  saving.value = true
  updateError.value = ''
  try {
    await props.primitives.update({
      kitchenId: props.state.kitchen.id,
      changes: {
        slug: normalizedSlug,
        status: status.value,
        visibility: visibility.value,
      },
    })
    updateOpen.value = false
  } catch (cause) {
    updateError.value =
      cause instanceof Error ? cause.message : 'Kitchen could not be updated.'
  } finally {
    saving.value = false
  }
}
</script>
