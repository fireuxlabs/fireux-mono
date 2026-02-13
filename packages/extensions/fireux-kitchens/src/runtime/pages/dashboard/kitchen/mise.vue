<template>
  <UDashboardPanel id="dashboard-kitchen-mise">
    <template #header>
      <LayoutsDashboardNavbar title="Mise en Place" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UCard>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Mise en place board</h2>
                <KitchenCardsPill v-if="kitchenPill" v-bind="kitchenPill" />
              </div>
              <p class="text-xs text-dimmed">
                Prep tasks for the active runtime kitchen.
              </p>
            </div>
          </template>
        </UCard>

        <UCard v-if="runtimeKitchenMode !== 'read-only'">
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Add mise task</div>
              <p class="text-xs text-dimmed">
                Save to
                <code>{{ runtimeKitchenCollectionPath }}/{{ runtimeKitchenId }}/mise/{task-id}</code>.
              </p>
            </div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2">
            <UFormField label="Task title" required>
              <UInput
                v-model="draft.title"
                placeholder="e.g. Slice tomatoes for service"
                icon="i-lucide-clipboard-list"
              />
            </UFormField>

            <UFormField label="Station">
              <UInput
                v-model="draft.station"
                placeholder="e.g. cold, grill, pass"
                icon="i-lucide-map-pin"
              />
            </UFormField>

            <UFormField label="Menu scope">
              <USelect
                v-model="draft.menu_id"
                :options="menuScopeOptions"
              />
            </UFormField>

            <UFormField label="Service date">
              <UInput
                v-model="draft.service_date"
                type="date"
                icon="i-lucide-calendar-days"
              />
            </UFormField>

            <UFormField label="Priority">
              <USelect
                v-model="draft.priority"
                :options="priorityOptions"
              />
            </UFormField>

            <UFormField label="Estimated minutes">
              <UInput
                v-model="draft.estimated_minutes"
                type="number"
                min="0"
                step="1"
                icon="i-lucide-timer"
              />
            </UFormField>

            <UFormField label="Kitchen ingredients required" required class="sm:col-span-2">
              <div v-if="kitchenIngredientOptions.length" class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <UButton
                    v-for="option in kitchenIngredientOptions"
                    :key="option.id"
                    size="xs"
                    :variant="selectedIngredientIds.includes(option.id) ? 'solid' : 'soft'"
                    color="primary"
                    @click="toggleIngredient(option.id)"
                  >
                    {{ option.name }}
                  </UButton>
                </div>
                <p class="text-xs text-dimmed">
                  Linked ingredients: {{ selectedIngredientIds.length }}
                </p>
              </div>
              <p v-else class="text-xs text-dimmed">
                No kitchen ingredients attached yet. Add kitchen ingredients first.
              </p>
            </UFormField>
          </div>

          <div class="mt-4 flex justify-end">
            <UButton
              :loading="isCreating"
              icon="i-lucide-plus"
              @click="createMiseTask"
            >
              Add task
            </UButton>
          </div>
        </UCard>

        <UCard v-else>
          <template #header>
            <div class="space-y-1">
              <div class="text-sm font-semibold">Add mise task</div>
              <p class="text-xs text-dimmed">
                Read-only mode. Edit <code>dummy/scenario.ts</code> to update mise tasks.
              </p>
            </div>
          </template>
        </UCard>

        <MiseCollectionManager
          v-if="miseTasks.length"
          :collection="miseTasks"
          title="Mise Tasks"
          description=""
        />
        <p v-else class="text-sm text-dimmed">No mise tasks yet.</p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import KitchenCardsPill from '../../../components/organisms/Kitchen/Cards/Pill.vue'
import MiseCollectionManager from '../../../components/organisms/Mise/Collection/Manager.vue'
import {
  useRuntimeKitchen,
  useRuntimeKitchenSelection,
} from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import { useIngredientFetch } from '../../../composables/fireux/firestore/ingredient/fetch/useIngredientFetch'
import { useKitchenIngredientFetch } from '../../../composables/fireux/firestore/ingredient/fetch/useKitchenIngredientFetch'
import { useKitchenMenuStackFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenMenuStackFetch'
import { useKitchenMiseCreate } from '../../../composables/fireux/firestore/mise/mutations/useKitchenMiseCreate'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import {
  type KitchenMisePriority,
} from '../../../models/kitchen-mise.model'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-mise',
    label: 'Mise en place',
    icon: 'i-lucide-clipboard-check',
    order: 2,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtimeKitchen = useRuntimeKitchen()
const { pill: kitchenPillBuilder } = useKitchenInterface()
const { runtimeKitchenMode } = useRuntimeKitchenSelection()
const { createKitchenMiseTask } = useKitchenMiseCreate()
const toast = useToastify()
const kitchenPill = computed(() => kitchenPillBuilder(runtimeKitchen.value))
const runtimeKitchenId = computed(() => String(runtimeKitchen.value?.id || '').trim())
const runtimeKitchenCollectionPath = computed(() =>
  runtimeKitchenMode.value === 'live' ? 'kitchens' : 'test-kitchens'
)
const firestoreKitchenId = computed(() =>
  runtimeKitchenMode.value === 'read-only' ? '' : runtimeKitchenId.value
)
const { miseTasks: firestoreMiseTasks, menus: firestoreMenus } = useKitchenMenuStackFetch(firestoreKitchenId, {
  kitchenCollectionPath: runtimeKitchenCollectionPath,
})
const { ingredients: firestoreKitchenIngredients } = useKitchenIngredientFetch(firestoreKitchenId, {
  kitchenCollectionPath: runtimeKitchenCollectionPath,
})
const { ingredients: firestoreGlobalIngredients } = useIngredientFetch()

const dummyMiseTasks = ref([...dummyKitchenScenario.menuStack.miseTasks])
const isCreating = ref(false)
const priorityOptions: KitchenMisePriority[] = ['low', 'normal', 'high', 'urgent']
const selectedIngredientIds = ref<string[]>([])

const todayIsoDate = () => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const draft = ref<{
  title: string
  station: string
  menu_id: string
  service_date: string
  priority: KitchenMisePriority
  estimated_minutes: number
}>({
  title: '',
  station: '',
  menu_id: 'all',
  service_date: todayIsoDate(),
  priority: 'normal',
  estimated_minutes: 15,
})

const resetDraft = () => {
  draft.value = {
    title: '',
    station: '',
    menu_id: 'all',
    service_date: todayIsoDate(),
    priority: 'normal',
    estimated_minutes: 15,
  }
  selectedIngredientIds.value = []
}

const globalIngredientsForMise = computed(() =>
  runtimeKitchenMode.value === 'read-only'
    ? [...dummyKitchenScenario.globalIngredients]
    : [...(firestoreGlobalIngredients.value ?? [])]
)

const globalIngredientById = computed(() => {
  const map = new Map<string, any>()
  for (const ingredient of globalIngredientsForMise.value) {
    const id = String((ingredient as any)?.id || '').trim()
    if (!id) continue
    map.set(id, ingredient)
  }
  return map
})

const kitchenIngredientsRawForMise = computed(() =>
  runtimeKitchenMode.value === 'read-only'
    ? [...dummyKitchenScenario.kitchenIngredients]
    : [...(firestoreKitchenIngredients.value ?? [])]
)

const kitchenIngredientsForMise = computed(() =>
  runtimeKitchenMode.value === 'read-only'
    ? kitchenIngredientsRawForMise.value.map((entry: any) => {
      const ingredientId = String(entry.ingredient_id || entry.id || '').trim()
      const global = globalIngredientById.value.get(ingredientId)
      return {
        ...(global ?? {}),
        ...entry,
        id: String(entry.id || ingredientId).trim() || ingredientId,
        ingredient_id: ingredientId,
      }
    })
    : kitchenIngredientsRawForMise.value
)

const menusForMise = computed(() =>
  runtimeKitchenMode.value === 'read-only'
    ? [...dummyKitchenScenario.menuStack.menus]
    : [...(firestoreMenus.value ?? [])]
)

const menuScopeOptions = computed(() => {
  const values = Array.from(
    new Set(
      menusForMise.value
        .map((menu) => String((menu as any)?.id || '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))
  return ['all', ...values]
})

const menuScopeSet = computed(() => new Set(menuScopeOptions.value))

const kitchenIngredientOptions = computed(() => {
  const byId = new Map<string, { id: string; name: string }>()
  for (const ingredient of kitchenIngredientsForMise.value) {
    const id = String((ingredient as any)?.ingredient_id || (ingredient as any)?.id || '').trim()
    if (!id) continue
    const name = String((ingredient as any)?.name || id).trim()
    if (!byId.has(id)) byId.set(id, { id, name })
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
})

const kitchenIngredientIdSet = computed(
  () => new Set(kitchenIngredientOptions.value.map((item) => item.id))
)

const toggleIngredient = (ingredientId: string) => {
  const id = String(ingredientId || '').trim()
  if (!id) return
  if (!kitchenIngredientIdSet.value.has(id)) return

  if (selectedIngredientIds.value.includes(id)) {
    selectedIngredientIds.value = selectedIngredientIds.value.filter((item) => item !== id)
    return
  }

  selectedIngredientIds.value = [...selectedIngredientIds.value, id]
}

const createMiseTask = async () => {
  if (isCreating.value) return
  if (runtimeKitchenMode.value === 'read-only') {
    toast.info('Read-only kitchen: edit dummy/scenario.ts')
    return
  }

  const kitchenId = runtimeKitchenId.value
  if (!kitchenId) {
    toast.error('Kitchen id missing')
    return
  }

  const title = String(draft.value.title || '').trim()
  if (!title) {
    toast.error('Task title is required')
    return
  }

  const ingredientIds = selectedIngredientIds.value.filter((id) =>
    kitchenIngredientIdSet.value.has(id)
  )
  if (!ingredientIds.length) {
    toast.error('Select at least one kitchen ingredient for this mise task')
    return
  }

  const selectedMenuId = String(draft.value.menu_id || '').trim()
  const menuId =
    selectedMenuId && selectedMenuId !== 'all' && menuScopeSet.value.has(selectedMenuId)
      ? selectedMenuId
      : ''

  isCreating.value = true
  try {
    await createKitchenMiseTask(
      kitchenId,
      {
        title,
        station: String(draft.value.station || '').trim(),
        menu_id: menuId,
        service_date: String(draft.value.service_date || '').trim(),
        priority: draft.value.priority,
        estimated_minutes: Number(draft.value.estimated_minutes || 0),
        ingredient_ids: ingredientIds,
      },
      {
        kitchenCollectionPath: runtimeKitchenCollectionPath.value,
      }
    )
    resetDraft()
    toast.success('Mise task created')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to create mise task'))
  } finally {
    isCreating.value = false
  }
}

const miseTasks = computed(() =>
  runtimeKitchenMode.value === 'read-only'
    ? dummyMiseTasks.value
    : [...(firestoreMiseTasks.value ?? [])]
)
</script>
