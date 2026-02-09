<template>
  <UDashboardPanel id="dashboard-kitchen-ingredients">
    <template #header>
      <LayoutsDashboardNavbar title="Kitchen Ingredients" />
    </template>

    <template #body>
      <div class="panels-stack">
        <UAlert
          v-if="!runtimeKitchenId"
          icon="i-lucide-triangle-alert"
          color="warning"
          title="Select a kitchen first"
          description="Choose a runtime kitchen to manage its ingredient attachments."
        />

        <template v-else>
          <UCard>
            <template #header>
              <div class="space-y-1">
                <div class="flex items-center justify-between gap-2">
                  <h2 class="text-base font-semibold">Kitchen ingredients</h2>
                  <UBadge variant="soft" color="neutral">
                    {{ selectedKitchenName }}
                  </UBadge>
                </div>
                <p class="text-xs text-dimmed">
                  Attach global ingredients to this kitchen. If the ingredient does not
                  exist yet, it will be created globally first.
                </p>
              </div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton
                size="xs"
                variant="soft"
                color="neutral"
                icon="i-lucide-house"
                :to="homeRoute"
              >
                Back to kitchen home
              </UButton>
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                icon="i-lucide-list"
                to="/ingredients"
              >
                View global ingredients
              </UButton>
            </div>
          </UCard>

          <div class="grid gap-4 lg:grid-cols-2">
            <KitchenIngredientsCreateSystem :kitchen-id="runtimeKitchenId" />

            <UCard>
              <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div class="space-y-1">
                    <div class="text-sm font-semibold">Attached ingredients</div>
                    <p class="text-xs text-dimmed">
                      {{ count }} total · filtered by your search
                    </p>
                  </div>
                  <UInput
                    v-model="query"
                    size="xs"
                    placeholder="Search attached ingredients..."
                  />
                </div>
              </template>

              <div v-if="filteredIngredients.length" class="space-y-2 text-sm">
                <div
                  v-for="ingredient in filteredIngredients"
                  :key="ingredient.id"
                  class="rounded-md border border-default p-3"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="space-y-1">
                      <p class="font-medium">
                        {{ ingredient.name || ingredient.id }}
                      </p>
                      <p class="text-xs text-dimmed">
                        {{ ingredient.category || 'Uncategorized' }}
                      </p>
                      <div class="flex flex-wrap items-center gap-2 text-xs text-dimmed">
                        <span>Unit: {{ ingredient.unit || 'n/a' }}</span>
                        <span>Cost: {{ formatCost(ingredient) }}</span>
                        <span>Status: {{ ingredient.status || 'active' }}</span>
                      </div>
                    </div>
                    <UButton
                      size="xs"
                      variant="ghost"
                      color="error"
                      icon="i-lucide-x"
                      @click="requestRemove(ingredient)"
                    >
                      Remove
                    </UButton>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-dimmed">
                {{ query ? 'No attached ingredients match your search.' : 'No attached ingredients yet.' }}
              </p>
            </UCard>
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>

  <UModal
    v-model="isRemoveConfirmOpen"
    title="Remove ingredient from kitchen?"
    :description="removeDescription"
  >
    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          :disabled="isRemoving"
          @click="isRemoveConfirmOpen = false"
        >
          Cancel
        </UButton>
        <UButton
          color="error"
          :loading="isRemoving"
          @click="confirmRemove"
        >
          Remove
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref } from 'vue'
import { useKitchenDashboardSelection } from '../../../composables/fireux/app/useKitchenDashboardSelection'
import { useKitchenIngredientFetch } from '../../../composables/fireux/firestore/objects/ingredient/fetch/useKitchenIngredientFetch'
import { useKitchenIngredientDelete } from '../../../composables/fireux/firestore/objects/ingredient/mutations/useKitchenIngredientDelete'
import type { KitchenIngredientResolved } from '../../../models/objects/ingredient.model'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    order: 14,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const { runtimeKitchenId, selectedKitchen, dashboardQuery } = useKitchenDashboardSelection()
const { ingredients, count } = useKitchenIngredientFetch(runtimeKitchenId)
const { removeKitchenIngredient } = useKitchenIngredientDelete()
const toast = useToastify()

const query = ref('')
const isRemoveConfirmOpen = ref(false)
const isRemoving = ref(false)
const pendingRemove = ref<KitchenIngredientResolved | null>(null)

const selectedKitchenName = computed(() =>
  String(selectedKitchen.value?.name || selectedKitchen.value?.short_name || runtimeKitchenId.value)
)

const homeRoute = computed(() =>
  dashboardQuery.value
    ? {
        path: '/dashboard/kitchen',
        query: dashboardQuery.value,
      }
    : '/dashboard/kitchen'
)

const sortedIngredients = computed(() =>
  [...(ingredients.value ?? [])].sort((a, b) =>
    String(a.name || a.id || '').localeCompare(String(b.name || b.id || ''))
  )
)

const filteredIngredients = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return sortedIngredients.value

  return sortedIngredients.value.filter((ingredient) => {
    const parts = [
      ingredient.name,
      ingredient.id,
      ingredient.category,
      ingredient.unit,
      ingredient.ingredient_id,
    ]
      .map((value) => String(value || '').toLowerCase())
      .filter(Boolean)

    return parts.some((value) => value.includes(q))
  })
})

const removeDescription = computed(() => {
  const name = pendingRemove.value?.name || pendingRemove.value?.id || 'this ingredient'
  return `Remove ${name} from this kitchen? This will not delete the global ingredient.`
})

const formatCost = (ingredient: KitchenIngredientResolved) => {
  const cost = Number(ingredient.cost_per_unit || 0)
  const currency = String(ingredient.currency || '').trim() || 'CHF'
  if (!Number.isFinite(cost) || cost <= 0) return 'n/a'
  return `${cost.toFixed(2)} ${currency}`
}

const requestRemove = (ingredient: KitchenIngredientResolved) => {
  pendingRemove.value = ingredient
  isRemoveConfirmOpen.value = true
}

const confirmRemove = async () => {
  if (!pendingRemove.value) return
  if (!runtimeKitchenId.value) return

  isRemoving.value = true
  try {
    const resolvedId = String(
      pendingRemove.value.id || pendingRemove.value.ingredient_id || ''
    ).trim()
    if (!resolvedId) throw new Error('Ingredient id missing')

    await removeKitchenIngredient(runtimeKitchenId.value, resolvedId)
    toast.success('Ingredient removed from kitchen')
    isRemoveConfirmOpen.value = false
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to remove ingredient'))
  } finally {
    isRemoving.value = false
  }
}
</script>
