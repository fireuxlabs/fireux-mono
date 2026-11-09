<template>
  <UModal
    v-model:open="open"
    title="Kitchen listing"
    description="Choose your Kitchen URL, status and directory visibility."
  >
    <template #body>
      <form class="workspace-surface" @submit.prevent="save">
        <UFormField label="URL name" :error="updateError || undefined">
          <UInput v-model="draft.slug" maxlength="80" autofocus />
        </UFormField>
        <UFormField label="Status">
          <USelect v-model="draft.status" :items="statusItems" />
        </UFormField>
        <UFormField label="Show in directory">
          <USwitch v-model="draft.visibility" />
        </UFormField>
        <FireCopyError v-if="updateError" :message="updateError" />
        <div class="fx-card__actions">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            type="button"
            @click="open = false"
          />
          <UButton
            label="Save changes"
            type="submit"
            :loading="saving"
            :disabled="!canSave"
          />
        </div>
      </form>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIdentityEditor } from 'fireux-core/runtime/composables/fireux/useIdentityEditor'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import type { KitchenWorkspaceIdentityState } from '../../composables/workspace/useKitchenWorkspaceIdentity'
import type { KitchenStatus } from '../../models/kitchen.model'

const props = defineProps<{
  open: boolean
  identity: KitchenWorkspaceIdentityState
}>()
const emit = defineEmits<{ 'update:open': [open: boolean] }>()
const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})
const statusItems: KitchenStatus[] = ['active', 'inactive', 'archived']
const { currentUser } = useAuth()
type KitchenListingDraft = {
  kitchenId: string
  slug: string
  status: KitchenStatus | undefined
  visibility: boolean
}
const canonicalSlug = (slug: string) => normalizeSlug(slug, { maxLength: 80 })
const {
  draft,
  changed,
  saving,
  error: updateError,
  save: saveDraft,
} = useIdentityEditor<KitchenListingDraft>({
  open,
  scope: [() => currentUser.value?.uid, () => props.identity.kitchenId.value],
  canEdit: () => props.identity.canWriteKitchen.value,
  createDraft: () => {
    const kitchen = props.identity.listing.value
    return {
      kitchenId: props.identity.kitchenId.value,
      slug: kitchen?.identity.slug || '',
      status: kitchen?.identity.status,
      visibility: kitchen?.identity.visibility ?? false,
    }
  },
  signature: (value) =>
    JSON.stringify([canonicalSlug(value.slug), value.status, value.visibility]),
  save: async (value, isCurrent) => {
    if (!value.kitchenId || value.kitchenId !== props.identity.kitchenId.value)
      throw new Error(
        'The selected Kitchen changed or is unavailable. Reopen the editor.'
      )
    const slug = value.slug.trim()
    if (!slug) throw new Error('Enter a Kitchen slug.')
    if (!value.status) throw new Error('Choose a Kitchen status.')
    await props.identity.update(
      {
        'identity.slug': slug,
        'identity.status': value.status,
        'identity.visibility': value.visibility,
      },
      isCurrent
    )
  },
  onSaved: () => {
    open.value = false
  },
  errorMessage: 'Kitchen could not be updated.',
})
const canSave = computed(() => {
  const saved = props.identity.listing.value?.identity
  const { slug, status, visibility } = draft.value
  if (!saved || !status) return false
  if (status !== saved.status || visibility !== saved.visibility)
    return changed.value
  const nextSlug = canonicalSlug(slug)
  if (nextSlug === saved.slug) return false
  // A legacy slug can change on save even when the draft matches on opening.
  return changed.value || nextSlug === canonicalSlug(saved.slug)
})
function save() {
  if (canSave.value) return saveDraft()
}
</script>
