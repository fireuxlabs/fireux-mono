<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Create dish</div>
      </div>
    </template>

    <form
      class="space-y-4"
      @submit.prevent="addDish"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Name">
          <UInput
            v-model="name"
            placeholder="Margherita"
            :disabled="saving || !canCreateDish"
          />
        </UFormField>

        <UFormField label="Description">
          <UTextarea
            v-model="description"
            placeholder="Tomato sauce, mozzarella, oregano"
            :disabled="saving || !canCreateDish"
            :rows="3"
          />
        </UFormField>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Mise ids">
          <UTextarea
            v-model="miseIds"
            placeholder="tomato-sauce, pizza-dough"
            :disabled="saving || !canCreateDish"
            :rows="3"
          />
        </UFormField>

        <UFormField label="Ingredient ids">
          <UTextarea
            v-model="ingredientIds"
            placeholder="mozzarella, oregano"
            :disabled="saving || !canCreateDish"
            :rows="3"
          />
        </UFormField>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UButton
          type="submit"
          icon="i-lucide-plus"
          :loading="saving"
          :disabled="!canCreateDish || !name.trim()"
        >
          Create dish
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
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleDishes'
import { useDishCreate } from '../../../../../composables/fireux/firestore/dish/mutations/useDishCreate'
import { normalizeDishStringArray } from '../../../../../models/dish.model'

const {
  kitchenId,
  rootCollection,
  databaseId,
  canWrite,
} = useKitchenConsoleDishes({ resolveMenuSections: false })
const { createDish } = useDishCreate({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const toast = useToastify()

const name = ref('')
const description = ref('')
const miseIds = ref('')
const ingredientIds = ref('')
const saving = ref(false)
const message = ref('')

const normalizeString = (value: unknown) => String(value ?? '').trim()
const parseIds = (value: string) =>
  normalizeDishStringArray(value.split(/[\n,]/g))
const canCreateDish = computed(() =>
  canWrite.value && Boolean(normalizeString(kitchenId.value))
)

const addDish = async () => {
  if (!canCreateDish.value || saving.value) return

  const dishName = normalizeString(name.value)
  if (!dishName) {
    toast.add({
      title: 'Dish name is required',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    return
  }

  saving.value = true
  message.value = ''

  try {
    const result = await createDish(
      {
        name: dishName,
        description: normalizeString(description.value),
        mise_ids: parseIds(miseIds.value),
        ingredient_ids: parseIds(ingredientIds.value),
      },
      { kitchenId: normalizeString(kitchenId.value) }
    )
    name.value = ''
    description.value = ''
    miseIds.value = ''
    ingredientIds.value = ''
    message.value = `Created ${dishName}.`
    if (result.failedLanguages.length) {
      toast.add({
        title: 'Dish created with translation gaps',
        description: `Failed languages: ${result.failedLanguages.join(', ')}`,
        color: 'amber',
        icon: 'i-heroicons-exclamation-triangle',
      })
    } else {
      toast.add({ title: 'Dish created', icon: 'i-heroicons-check-circle' })
    }
  } catch (error) {
    const errorMessage = String((error as any)?.message || error || 'Create dish failed.')
    message.value = errorMessage
    toast.add({
      title: 'Dish create failed',
      description: errorMessage,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    saving.value = false
  }
}
</script>
