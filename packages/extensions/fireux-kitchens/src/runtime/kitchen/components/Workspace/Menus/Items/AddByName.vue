<template>
  <div class="space-y-3 rounded-xl border border-default p-4">
    <details>
      <summary class="cursor-pointer text-sm text-muted">
        Add dishes by name
      </summary>
      <div class="mt-3 space-y-3">
        <UTextarea
          v-model="names"
          aria-label="Dish names"
          placeholder="One dish per line"
          class="w-full"
        />
        <p class="text-sm text-muted">
          Matching kitchen dishes are reused. New names create dishes in your
          catalogue.
        </p>
        <UButton
          label="Add listed dishes"
          :loading="busy"
          :disabled="!names.trim() || !canWrite"
          @click="addNames"
        />
      </div>
    </details>
    <MoleculesCopyError v-if="error" :message="error" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useKitchenWorkspaceMenuSection } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import { useDishCreate } from '../../../../composables/dish/useDishCreate'
const {
  kitchenId,
  menuId,
  sectionId,
  dishes,
  itemRows,
  canWrite,
  createItem,
  rootCollection,
  databaseId,
} = useKitchenWorkspaceMenuSection()
const { createDish } = useDishCreate({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const names = ref('')
const error = ref('')
const busy = ref(false)

async function add(id: string) {
  if (itemRows.value.some((row) => row.dishId === id)) return
  await createItem({
    kitchenId: kitchenId.value,
    menuId: menuId.value,
    sectionId: sectionId.value,
    dishId: id,
    sort_order: itemRows.value.length,
  })
}
async function run(work: () => Promise<void>) {
  if (busy.value || !canWrite.value) return
  busy.value = true
  error.value = ''
  try {
    await work()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    busy.value = false
  }
}

const addNames = () =>
  run(async () => {
    const lines = [
      ...new Set(
        names.value
          .split('\n')
          .map((name) => name.trim())
          .filter(Boolean)
      ),
    ]
    if (lines.length > 30 || lines.some((name) => name.length > 160))
      throw new Error('Use up to 30 dish names, each under 160 characters.')
    for (const name of lines) {
      const match = dishes.value.find(
        (dish) => dish.name.toLocaleLowerCase() === name.toLocaleLowerCase()
      )
      const id =
        match?.id ||
        (await createDish({ name }, { kitchenId: kitchenId.value })).id
      await add(id)
    }
    names.value = ''
  })
</script>
