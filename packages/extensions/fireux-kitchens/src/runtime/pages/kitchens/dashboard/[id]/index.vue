<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="kitchenTo"
        >
          Back to kitchen
        </UButton>
        <UButton
          size="xs"
          color="primary"
          icon="i-lucide-users"
          :to="moduleTo('team')"
        >
          Team & Labour
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <div class="grid gap-4 lg:grid-cols-2">
        <UCard v-for="module in modules" :key="module.key">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold">{{ module.title }}</div>
                <p class="text-xs text-dimmed">{{ module.description }}</p>
              </div>
              <UBadge variant="soft" color="neutral">{{ module.badge }}</UBadge>
            </div>
          </template>

          <div class="flex items-center justify-between gap-2">
            <span class="text-sm text-dimmed">{{ module.status }}</span>
            <UButton
              size="xs"
              variant="soft"
              color="primary"
              :to="module.to"
            >
              Open
            </UButton>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'

definePageMeta({
  layout: 'default',
  title: 'Kitchen Dashboard',
  description: 'Run the kitchen with operational tools.',
  head: { title: 'Kitchen Dashboard' },
})

const route = useRoute()
const raw = route.params.id
const docId = computed(() => (Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')))

const dashboardBase = computed(() =>
  docId.value ? `/kitchens/dashboard/${encodeURIComponent(docId.value)}` : '/kitchens'
)
const kitchenTo = computed(() =>
  docId.value ? `/kitchens/${encodeURIComponent(docId.value)}` : '/kitchens'
)

const moduleTo = (slug: string) => `${dashboardBase.value}/${slug}`

const pageTitle = computed(() => 'Kitchen Dashboard')
const pageDescription = computed(() => 'Operational overview for this kitchen.')

const modules = computed(() => [
  {
    key: 'team',
    title: 'Team & Labour',
    description: 'Staff list, roles, and labour insights.',
    badge: 'Premium',
    status: 'Staff roster · Roles',
    to: moduleTo('team'),
  },
  {
    key: 'ingredients',
    title: 'Ingredients',
    description: 'Inventory, par levels, and suppliers.',
    badge: 'Premium',
    status: 'Inventory · Pars',
    to: moduleTo('ingredients'),
  },
  {
    key: 'mise',
    title: 'Mise en Place',
    description: 'Prep lists linked to ingredients.',
    badge: 'Premium',
    status: 'Prep lists',
    to: moduleTo('mise'),
  },
  {
    key: 'menus',
    title: 'Menus',
    description: 'Live and paused dishes.',
    badge: 'Premium',
    status: 'Menus · Dishes',
    to: moduleTo('menus'),
  },
  {
    key: 'costs',
    title: 'Costs',
    description: 'Labour and ingredient costs (admin only).',
    badge: 'Later',
    status: 'Margins · Costs',
    to: moduleTo('costs'),
  },
])
</script>
