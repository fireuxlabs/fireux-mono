<template>
  <div class="space-y-3 rounded-xl border border-default p-4">
    <h2 class="font-semibold">New dishes</h2>
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
      <UFormField
        v-for="name in newNames"
        :key="name"
        :label="`${name} · Normal price`"
        required
      >
        <!-- @vue-generic {string | number, {}} -->
        <UInput
          v-model="prices[name]"
          type="number"
          min="0"
          step="0.01"
          :aria-label="`${name} normal price`"
          :disabled="busy || !canWrite"
        />
      </UFormField>
      <UButton
        label="Add listed dishes"
        :loading="busy"
        :disabled="busy || !names.trim() || !canWrite"
        @click="addNames"
      />
    </div>
    <MoleculesCopyError v-if="error" :message="error" />
  </div>
</template>
<script setup lang="ts">
import { useDishEditorScope } from '../../../../../composables/dish/useDishEditorScope'
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useKitchenWorkspaceMenuSection } from '../../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import { useDishCreate } from '../../../../../composables/dish/useDishCreate'
const { kitchenId, menuId, sectionId, dishes, itemRows, canWrite, createItem } =
  useKitchenWorkspaceMenuSection()
const route = useRoute()
const names = ref('')
const prices = ref<Record<string, string | number>>({})
const newNames = computed(() =>
  [
    ...new Set(
      names.value
        .split('\n')
        .map((name) => name.trim())
        .filter(Boolean)
    ),
  ].filter(
    (name) =>
      !dishes.value.some(
        (dish) => dish.name.toLocaleLowerCase() === name.toLocaleLowerCase()
      )
  )
)
const error = ref('')
const busy = ref(false)

useDishEditorScope([kitchenId, menuId, sectionId, () => route.fullPath], () => {
  prices.value = {}
  names.value = ''
  error.value = ''
  busy.value = false
})
const ownerSources = [
  kitchenId,
  menuId,
  sectionId,
  () => route.fullPath,
  names,
  () => JSON.stringify(prices.value),
]
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
  const requestedPrices = { ...prices.value }
  const known = new Map(
    dishes.value.map((dish) => [dish.name.toLocaleLowerCase(), dish.id])
  )
  const placed = new Set(itemRows.value.map((row) => row.dishId))
  busy.value = true
  error.value = ''
  try {
    if (lines.length > 30 || lines.some((name) => name.length > 160))
      throw new Error('Use up to 30 dish names, each under 160 characters.')
    for (const name of lines.filter(
      (name) => !known.has(name.toLocaleLowerCase())
    )) {
      const price = requestedPrices[name]
      if (
        price === undefined ||
        String(price).trim() === '' ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
      )
        throw new Error(`Enter a normal price for ${name}.`)
    }
    for (const name of lines) {
      if (!isCurrent()) return
      let id = known.get(name.toLocaleLowerCase())
      if (!id) {
        id = (
          await createDish(
            { name, price: Number(requestedPrices[name]) },
            { kitchenId: target.kitchenId }
          )
        ).id
        if (!isCurrent()) return
        known.set(name.toLocaleLowerCase(), id)
      }
      if (placed.has(id)) continue
      try {
        await createItem({ ...target, dishId: id })
      } catch (cause) {
        if (!isCurrent()) return
        throw new Error(
          `Dish “${name}” exists, but adding it to this Menu failed. Retry after the catalogue refreshes to reuse it. ${cause instanceof Error ? cause.message : String(cause)}`
        )
      }
      if (!isCurrent()) return
      placed.add(id)
    }
    prices.value = {}
    names.value = ''
  } catch (cause) {
    if (isCurrent())
      error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
