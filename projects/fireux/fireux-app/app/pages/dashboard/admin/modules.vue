<!-- Concurrent edit — 2026-07-21 17:01 CEST — Dashboard Family pass: replace free-text Module slugs with the source-controlled catalogue. -->
<template>
  <UDashboardPanel id="dashboard-admin-modules">
    <template #header>
      <FireLayoutsDashboardNavbar title="Featured modules" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <DashboardAdminFeaturedSlugsSelection
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
                <div class="pagebody">
                  <FireActionSurface
                    v-for="module in modules"
                    :key="module.id"
                    action
                    :aria-label="`${isSelected(module.id, selectedValues) ? 'Remove' : 'Feature'} ${module.name}`"
                    class="card card--cell"
                    :data-selected="isSelected(module.id, selectedValues)"
                    @activate="toggleSlug(module.id)"
                  >
                    <div>
                      <div>
                        <UIcon :name="module.icon" />
                      </div>
                      <div>
                        <p class="fx-type-body">
                          {{ module.name }}
                        </p>
                        <code>{{ module.id }}</code>
                        <p class="fx-type-caption">
                          {{ module.description }}
                        </p>
                      </div>
                    </div>

                    <UBadge
                      :color="
                        isSelected(module.id, selectedValues)
                          ? 'primary'
                          : 'neutral'
                      "
                      :variant="
                        isSelected(module.id, selectedValues) ? 'solid' : 'soft'
                      "
                    >
                      {{
                        isSelected(module.id, selectedValues)
                          ? 'Featured'
                          : 'Feature'
                      }}
                    </UBadge>
                  </FireActionSurface>
                </div>
              </UPageCard>
            </template>
          </DashboardAdminFeaturedSlugsSelection>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import DashboardAdminFeaturedSlugsSelection from '../../../components/Dashboard/Admin/FeaturedSlugsSelection.vue'
import { fireuxExtensionModules } from '../../../module-catalogue'

const modules = [...fireuxExtensionModules].sort((a, b) =>
  a.name.localeCompare(b.name)
)

const isSelected = (slug: string, selectedValues: string[]) =>
  selectedValues.includes(slug)

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
