<template>
  <section class="grid gap-3 sm:grid-cols-3" aria-label="Supplier records">
    <Summary
      title="Catalogues"
      icon="i-lucide-book-open"
      to="/workspace/supplier/catalogue"
      :value="value(catalogues)"
      :pending="pending(catalogues)"
      :error="failed(catalogues)"
      description="Catalogue groupings"
    />
    <Summary
      title="Items"
      icon="i-lucide-package"
      to="/workspace/supplier/items"
      :value="value(items)"
      :pending="pending(items)"
      :error="failed(items)"
      description="Supplier-owned items"
    />
    <Summary
      title="Ingredients"
      icon="i-lucide-carrot"
      to="/workspace/supplier/ingredients"
      :value="value(ingredients)"
      :pending="pending(ingredients)"
      :error="failed(ingredients)"
      description="Ingredient associations"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, type Ref } from 'vue'
import Summary from 'fireux-core/runtime/components/Workspace/Overview/Summary.vue'
import { useSupplierWorkspace } from '../../../composables/workspace/useSupplierWorkspace'
import { useSupplierCatalogueCollection } from '../../../composables/useSupplierCatalogueCollection'
import { useSupplierItemCollection } from '../../../composables/useSupplierItemCollection'
import { useSupplierIngredientCollection } from '../../../composables/useSupplierIngredientCollection'
const workspace = useSupplierWorkspace()
const enabled = computed(() => workspace.outcome.value === 'ready')
const catalogues = useSupplierCatalogueCollection(workspace.id, { enabled })
const items = useSupplierItemCollection(workspace.id, { enabled })
const ingredients = useSupplierIngredientCollection(workspace.id, { enabled })
type CountSource = {
  count: Readonly<Ref<number>>
  outcome: Readonly<Ref<string>>
}
const outcome = (source: CountSource) =>
  workspace.outcome.value === 'ready'
    ? source.outcome.value
    : workspace.outcome.value
const value = (source: CountSource) =>
  ['ready', 'empty'].includes(outcome(source)) ? source.count.value : '—'
const pending = (source: CountSource) => outcome(source) === 'pending'
const failed = (source: CountSource) => outcome(source) === 'error'
</script>
