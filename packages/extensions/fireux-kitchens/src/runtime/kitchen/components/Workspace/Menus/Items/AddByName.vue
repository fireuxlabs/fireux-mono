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
          :disabled="busy || !canWrite"
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
          :disabled="busy || !names.trim() || !canWrite"
          @click="addNames"
        />
      </div>
    </details>
    <MoleculesCopyError v-if="error" :message="error" />
  </div>
</template>
<script setup lang="ts">
import { useDishEditorScope } from '../../../../composables/dish/useDishEditorScope'
import { ref } from 'vue'
import { useRoute } from '#imports'
import { useKitchenWorkspaceMenuSection } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import { useDishCreate } from '../../../../composables/dish/useDishCreate'
const { kitchenId, menuId, sectionId, dishes, itemRows, canWrite, createItem } =
  useKitchenWorkspaceMenuSection()
const route = useRoute()
const names = ref('')
const error = ref('')
const busy = ref(false)

useDishEditorScope([kitchenId, menuId, sectionId, () => route.fullPath], () => {
  names.value = ''
  error.value = ''
  busy.value = false
})
const ownerSources = [kitchenId, menuId, sectionId, () => route.fullPath, names]
const captureScope = useDishEditorScope(ownerSources, () => {
  error.value = ''
  busy.value = false
})
const { createDish } = useDishCreate([...ownerSources, canWrite])
async function addNames() {
  if (busy.value || !canWrite.value) return
  const isCurrent = captureScope()
  const target = {
    kitchenId: kitchenId.value,
    menuId: menuId.value,
    sectionId: sectionId.value,
  }
  const lines = [
    ...new Set(
      names.value
        .split('\n')
        .map((name) => name.trim())
        .filter(Boolean)
    ),
  ]
  const known = new Map(
    dishes.value.map((dish) => [dish.name.toLocaleLowerCase(), dish.id])
  )
  const placed = new Set(itemRows.value.map((row) => row.dishId))
  let sortOrder = itemRows.value.length
  busy.value = true
  error.value = ''
  try {
    if (lines.length > 30 || lines.some((name) => name.length > 160))
      throw new Error('Use up to 30 dish names, each under 160 characters.')
    for (const name of lines) {
      if (!isCurrent()) return
      let id = known.get(name.toLocaleLowerCase())
      if (!id) {
        id = (await createDish({ name }, { kitchenId: target.kitchenId })).id
        if (!isCurrent()) return
        known.set(name.toLocaleLowerCase(), id)
      }
      if (placed.has(id)) continue
      try {
        await createItem({ ...target, dishId: id, sort_order: sortOrder })
      } catch (cause) {
        if (!isCurrent()) return
        throw new Error(
          `Dish “${name}” exists, but adding it to this Menu failed. Retry after the catalogue refreshes to reuse it. ${cause instanceof Error ? cause.message : String(cause)}`
        )
      }
      if (!isCurrent()) return
      placed.add(id)
      sortOrder += 1
    }
    names.value = ''
  } catch (cause) {
    if (isCurrent())
      error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
