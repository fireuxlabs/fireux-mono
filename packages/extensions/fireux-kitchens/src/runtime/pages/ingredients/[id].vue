<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/ingredients"
        >
          Back
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <div v-if="loading" class="py-10 text-sm opacity-70">
        Loading ingredient...
      </div>

      <div v-else-if="!ingredient" class="space-y-2">
        <h1 class="text-lg font-semibold">Ingredient Not Found</h1>
        <p>The ingredient you are looking for does not exist.</p>
        <NuxtLink to="/ingredients" class="text-primary hover:underline">
          &larr; Back
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <div v-if="isAdmin && ingredient" class="flex flex-wrap gap-2">
          <UButton
            size="xs"
            variant="soft"
            color="neutral"
            icon="i-lucide-pencil"
            @click="showAdmin = !showAdmin"
          >
            {{ showAdmin ? 'Hide edit' : 'Edit' }}
          </UButton>
          <UButton
            size="xs"
            variant="soft"
            color="error"
            icon="i-lucide-trash"
            @click="isDeleteConfirmOpen = true"
          >
            Delete
          </UButton>
        </div>

        <IngredientCardsProfile
          v-if="ingredientProfile"
          :model="ingredientProfile"
        />

        <UCard v-if="isAdmin && showAdmin">
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Admin edit</div>
              <p class="text-xs text-dimmed">Update the ingredient details.</p>
            </div>
          </template>

          <div class="space-y-4">
            <UFormGroup label="Name" required>
              <UInput v-model="form.name" placeholder="Ingredient name" />
            </UFormGroup>

            <UFormGroup label="Category">
              <UInput v-model="form.category" placeholder="Category" />
            </UFormGroup>

            <UFormGroup label="Unit" required>
              <USelect v-model="form.unit" :options="ingredientUnitOptions" />
            </UFormGroup>

            <UFormGroup label="Status" required>
              <USelect v-model="form.status" :options="statusOptions" />
            </UFormGroup>

            <UFormGroup label="Description">
              <UTextarea v-model="form.description" placeholder="Optional description" />
            </UFormGroup>

            <div class="flex justify-end gap-2">
              <UButton
                variant="ghost"
                :disabled="saving || !isDirty"
                @click="resetForm"
              >
                Reset
              </UButton>
              <UButton
                color="primary"
                :loading="saving"
                :disabled="!isDirty"
                @click="saveChanges"
              >
                Save changes
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>

  <UModal
    v-model="isDeleteConfirmOpen"
    title="Delete ingredient?"
    :description="deleteDescription"
  >
    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          :disabled="deleting"
          @click="isDeleteConfirmOpen = false"
        >
          Cancel
        </UButton>
        <UButton
          color="error"
          :loading="deleting"
          @click="confirmDelete"
        >
          Delete
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { navigateTo, useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, reactive, ref, watchEffect } from 'vue'
import { ingredientUnitOptions } from '../../components/organisms/Ingredient/Create/types'
import { useIngredientFetch } from '../../composables/fireux/firestore/ingredient/fetch/useIngredientFetch'
import { useIngredientInterface } from '../../composables/fireux/firestore/ingredient/utils/view/useIngredientInterface'
import type { Ingredient, IngredientStatus, IngredientUnit } from '../../models/ingredient.model'

definePageMeta({
  layout: 'default',
  title: 'Ingredient',
  description: 'View a saved ingredient.',
})

const { appName } = useFireUXConfig()
const route = useRoute()
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { ingredients } = useIngredientFetch()
const { isAdmin } = useUser()
const { updateDocument } = useFirestoreUpdate()
const { deleteDocument } = useFirestoreDelete()
const toast = useToastify()

const ingredient = computed<Ingredient | null>(() => {
  const list = ingredients.value ?? []
  return list.find((item) => String(item.id) === docId) ?? null
})

const loading = computed(() => ingredients.value === undefined)

const { profile } = useIngredientInterface()
const ingredientProfile = computed(() => profile(ingredient.value))

const showAdmin = ref(false)
const isDeleteConfirmOpen = ref(false)
const saving = ref(false)
const deleting = ref(false)

const form = reactive<{
  name: string
  category: string
  unit: IngredientUnit
  status: IngredientStatus
  description: string
}>({
  name: '',
  category: '',
  unit: 'piece',
  status: 'active',
  description: '',
})

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
] as const

watchEffect(() => {
  const entry = ingredient.value
  if (!entry) return
  form.name = entry.name ?? ''
  form.category = entry.category ?? ''
  form.unit = entry.unit ?? 'piece'
  form.status = entry.status ?? 'active'
  form.description = entry.description ?? ''
})

const isDirty = computed(() => {
  const entry = ingredient.value
  if (!entry) return false
  return (
    form.name.trim() !== String(entry.name ?? '').trim() ||
    form.category.trim() !== String(entry.category ?? '').trim() ||
    form.unit !== (entry.unit ?? 'piece') ||
    form.status !== (entry.status ?? 'active') ||
    form.description.trim() !== String(entry.description ?? '').trim()
  )
})

const resetForm = () => {
  const entry = ingredient.value
  if (!entry) return
  form.name = entry.name ?? ''
  form.category = entry.category ?? ''
  form.unit = entry.unit ?? 'piece'
  form.status = entry.status ?? 'active'
  form.description = entry.description ?? ''
}

const saveChanges = async () => {
  if (!ingredient.value || !docId || !isDirty.value) return
  saving.value = true
  try {
    await updateDocument<Ingredient>('ingredients', docId, {
      name: form.name.trim(),
      category: form.category.trim(),
      unit: form.unit,
      status: form.status as Ingredient['status'],
      description: form.description.trim(),
    })
    toast.success('Ingredient updated')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to update ingredient'))
  } finally {
    saving.value = false
  }
}

const deleteDescription = computed(() => {
  const name = ingredient.value?.name || docId || 'this ingredient'
  return `Delete ${name}? This cannot be undone.`
})

const confirmDelete = async () => {
  if (!docId) return
  deleting.value = true
  try {
    await deleteDocument('ingredients', docId)
    toast.success('Ingredient deleted')
    await navigateTo('/ingredients')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to delete ingredient'))
  } finally {
    deleting.value = false
    isDeleteConfirmOpen.value = false
  }
}

const pageTitle = computed(() => ingredient.value?.name || 'Ingredient')
const pageDescription = computed(() => {
  const entry = ingredient.value
  if (!entry) return 'Ingredient details.'
  return [entry.category, entry.unit].filter(Boolean).join(' · ') || 'Ingredient details.'
})

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})
</script>
