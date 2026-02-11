<template>
  <UDashboardPanel id="dashboard-kitchen-menu">
    <template #header>
      <LayoutsDashboardNavbar title="Menu" />
    </template>

    <template #body>
      <div class="space-y-6">
        <UAlert
          v-if="!runtimeKitchenId"
          icon="i-lucide-triangle-alert"
          color="warning"
          title="Select a kitchen first"
          description="Open /kitchens and select a runtime kitchen before building a menu."
        />

        <UCard v-else>
          <template #header>
            <div class="space-y-1">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h2 class="text-base font-semibold">Add dish</h2>
                <UBadge variant="soft" color="neutral">
                  {{ runtimeKitchenId }}
                </UBadge>
              </div>
              <p class="text-xs text-dimmed">
                Create dishes for the menu. This is UI-only for now.
              </p>
            </div>
          </template>

          <div class="space-y-3">
            <div>
              <div class="text-xs font-medium text-dimmed">Dish name</div>
              <UInput v-model="form.name" placeholder="Cheeseburger" />
            </div>

            <div>
              <div class="text-xs font-medium text-dimmed">Description</div>
              <UTextarea
                v-model="form.description"
                placeholder="Toasted bun, beef patty, lettuce, tomato, cheese"
              />
            </div>

            <div class="pt-2">
              <UButton color="primary" @click="handleSubmit">
                Add dish
              </UButton>
              <UButton
                class="ml-2"
                variant="ghost"
                color="neutral"
                @click="resetForm"
              >
                Clear
              </UButton>
            </div>
          </div>
        </UCard>

        <UCard v-if="runtimeKitchenId">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <div class="text-sm font-semibold">Dishes</div>
              <UBadge variant="soft">{{ dishes.length }}</UBadge>
            </div>
          </template>

          <div v-if="dishes.length" class="space-y-2">
            <div
              v-for="dish in dishes"
              :key="dish.id"
              class="rounded-md border border-default p-3"
            >
              <div class="text-sm font-semibold">{{ dish.name }}</div>
              <p class="text-xs text-dimmed">
                {{ dish.description || 'No description yet.' }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm text-dimmed">
            No dishes yet.
          </p>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref } from 'vue'
import { useRuntimeKitchen } from '../../../composables/fireux/app/useRuntimeKitchen'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-menu',
    label: 'Menus',
    icon: 'i-lucide-book-open-check',
    order: 15,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtimeKitchen = useRuntimeKitchen()
const runtimeKitchenId = computed(() => String(runtimeKitchen.value?.id || '').trim())

const toast = useToastify()

const dishes = ref<{ id: string; name: string; description: string }[]>([])

const form = ref({
  name: '',
  description: '',
})

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
  }
}

const handleSubmit = () => {
  if (!form.value.name.trim()) {
    toast.error('Dish name is required')
    return
  }

  const nextDish = {
    id: `${form.value.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    name: form.value.name.trim(),
    description: form.value.description.trim(),
  }
  dishes.value = [nextDish, ...dishes.value]
  toast.success('Dish added (UI only)')
  resetForm()
}
</script>

