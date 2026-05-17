<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Create recipe</div>
      </div>
    </template>

    <form
      class="space-y-4"
      @submit.prevent="addRecipe"
    >
      <UFormField label="Name">
        <UInput
          v-model="name"
          placeholder="Tomato sauce"
          :disabled="saving || !canCreateRecipe"
        />
      </UFormField>

      <UFormField label="Description">
        <UTextarea
          v-model="description"
          placeholder="Simple tomato sauce"
          :disabled="saving || !canCreateRecipe"
          :rows="3"
        />
      </UFormField>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          type="submit"
          icon="i-lucide-plus"
          :loading="saving"
          :disabled="!canCreateRecipe || !name.trim()"
        >
          Create recipe
        </UButton>

        <p
          v-if="message"
          class="text-xs text-dimmed"
        >
          {{ message }}
        </p>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref } from 'vue'
import { useKitchenConsoleRecipes } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleRecipes'
import { useRecipeCreate } from '../../../../../composables/fireux/firestore/recipe/mutations/useRecipeCreate'

const {
  kitchenId,
  rootCollection,
  databaseId,
  canWrite,
} = useKitchenConsoleRecipes()
const { createRecipe } = useRecipeCreate({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const toast = useToastify()

const name = ref('')
const description = ref('')
const saving = ref(false)
const message = ref('')

const normalizeString = (value: unknown) => String(value ?? '').trim()
const canCreateRecipe = computed(() =>
  canWrite.value && Boolean(normalizeString(kitchenId.value))
)

const addRecipe = async () => {
  if (!canCreateRecipe.value || saving.value) return

  const recipeName = normalizeString(name.value)
  if (!recipeName) {
    toast.add({
      title: 'Recipe name is required',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    return
  }

  saving.value = true
  message.value = ''

  try {
    const result = await createRecipe(
      {
        name: recipeName,
        description: normalizeString(description.value),
      },
      { kitchenId: normalizeString(kitchenId.value) }
    )
    name.value = ''
    description.value = ''
    message.value = `Created ${recipeName}.`
    if (result.failedLanguages.length) {
      toast.add({
        title: 'Recipe created with translation gaps',
        description: `Failed languages: ${result.failedLanguages.join(', ')}`,
        color: 'amber',
        icon: 'i-heroicons-exclamation-triangle',
      })
    } else {
      toast.add({ title: 'Recipe created', icon: 'i-heroicons-check-circle' })
    }
  } catch (error) {
    const errorMessage = String((error as any)?.message || error || 'Create recipe failed.')
    message.value = errorMessage
    toast.add({
      title: 'Recipe create failed',
      description: errorMessage,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    saving.value = false
  }
}
</script>
