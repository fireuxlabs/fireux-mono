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
import { useKitchenConsoleDishes } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDishes'
import { useDish } from '../../../../../composables/fireux/firestore/dish/useDish'

const {
  kitchenId,
  rootCollection,
  databaseId,
  canWrite,
} = useKitchenConsoleDishes({ resolveMenuSections: false })
const { createDish } = useDish({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const toast = useToastify()

const name = ref('')
const description = ref('')
const saving = ref(false)
const message = ref('')

const normalizeString = (value: unknown) => String(value ?? '').trim()
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
    await createDish(
      {
        name: dishName,
        description: normalizeString(description.value),
      },
      { kitchenId: normalizeString(kitchenId.value) }
    )
    name.value = ''
    description.value = ''
    message.value = `Created ${dishName}.`
    toast.add({ title: 'Dish created', icon: 'i-heroicons-check-circle' })
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
