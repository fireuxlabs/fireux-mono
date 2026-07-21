<!-- Concurrent edit — 2026-07-21 17:01 CEST — Dashboard Family pass: replace free-text Module slugs with the source-controlled catalogue. -->
<template>
  <UDashboardPanel id="dashboard-admin-modules">
    <template #header>
      <LayoutsDashboardNavbar title="Featured modules" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <AdminFeaturedSlugsSelection
            field="featured_module_slugs"
            headline="Public catalogue curation"
            title="Featured modules"
            description="Choose which reusable FireUX modules appear first on public Module surfaces."
            empty-label="No featured modules selected yet."
            saved-label="Featured modules saved"
            failed-label="Failed to save featured modules"
          >
            <template #default="{ selectedValues, toggleSlug }">
              <UPageCard
                title="Module catalogue"
                description="Select a module to add or remove it from the featured list."
                icon="i-lucide-puzzle"
                variant="subtle"
              >
                <div class="grid gap-3 sm:grid-cols-2">
                  <MoleculesActionSurface
                    v-for="module in modules"
                    :key="module.id"
                    action
                    :aria-label="`${isSelected(module.id, selectedValues) ? 'Remove' : 'Feature'} ${module.name}`"
                    :class="selectionClass(isSelected(module.id, selectedValues))"
                    @activate="toggleSlug(module.id)"
                  >
                    <div class="flex items-start gap-3 p-2 pr-20">
                      <div
                        class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-elevated"
                      >
                        <UIcon :name="module.icon" class="size-5 text-primary" />
                      </div>
                      <div class="min-w-0">
                        <p class="font-semibold text-highlighted">
                          {{ module.name }}
                        </p>
                        <code class="text-xs text-dimmed">{{ module.id }}</code>
                        <p class="mt-2 text-sm leading-6 text-muted">
                          {{ module.description }}
                        </p>
                      </div>
                    </div>

                    <UBadge
                      class="absolute right-3 top-3"
                      :color="isSelected(module.id, selectedValues) ? 'primary' : 'neutral'"
                      :variant="isSelected(module.id, selectedValues) ? 'solid' : 'soft'"
                    >
                      {{ isSelected(module.id, selectedValues) ? 'Featured' : 'Feature' }}
                    </UBadge>
                  </MoleculesActionSurface>
                </div>
              </UPageCard>
            </template>
          </AdminFeaturedSlugsSelection>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import AdminFeaturedSlugsSelection from 'fireux-core/runtime/components/Admin/FeaturedSlugsSelection.vue'
import { fireuxExtensionModules } from '../../../module-catalogue'

const modules = [...fireuxExtensionModules].sort((a, b) =>
  a.name.localeCompare(b.name)
)

const isSelected = (slug: string, selectedValues: string[]) =>
  selectedValues.includes(slug)

const selectionClass = (selected: boolean) => [
  'relative w-full rounded-lg border p-2 transition',
  selected
    ? 'border-primary bg-primary/5'
    : 'border-default bg-default hover:border-primary/50',
]

definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'modules',
    label: 'Featured modules',
    description:
      'Choose which reusable modules appear first on public surfaces.',
    icon: 'i-lucide-puzzle',
    order: 60,
  },
  requiresAuth: true,
  roles: ['admin'],
})

useHead({ title: 'Featured modules' })
</script>
