<template>
  <div class="space-y-4">
    <MenuSchedule v-if="menu" v-model="selectedDate" />
    <UAlert
      v-if="!menu"
      color="neutral"
      variant="soft"
      :title="emptyTitle"
      :description="emptyDescription"
    />

    <UCard v-else>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              {{ daily ? formattedDate : 'Menu sections' }}
            </h2>
            <p class="text-sm text-dimmed">
              {{
                menu.description ||
                'Build the menu from sections and dish-backed items.'
              }}
            </p>
          </div>
          <UButton
            v-if="!daily"
            size="sm"
            color="neutral"
            variant="soft"
            :icon="showCreateSection ? 'i-lucide-minus' : 'i-lucide-plus'"
            :aria-label="
              showCreateSection ? 'Hide section fields' : 'Add section'
            "
            :disabled="!canWrite"
            @click="showCreateSection = !showCreateSection"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div
          v-if="showCreateSection"
          class="grid gap-3 rounded-lg border border-default p-3 md:grid-cols-[1fr_1fr_auto]"
        >
          <UFormField label="Section">
            <UInput
              v-model="newSectionLabel"
              placeholder="Starters"
              :disabled="savingSection || !canWrite"
            />
          </UFormField>

          <UFormField label="Description">
            <UInput
              v-model="newSectionDescription"
              placeholder="Optional"
              :disabled="savingSection || !canWrite"
            />
          </UFormField>

          <div class="flex items-end">
            <UButton
              icon="i-lucide-plus"
              :loading="savingSection"
              :disabled="!canCreateSection"
              @click="addSection"
            >
              Add
            </UButton>
          </div>
        </div>

        <div v-if="visibleSections.length" class="space-y-3">
          <article
            v-for="section in visibleSections"
            :key="section.id"
            class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-default bg-default p-3"
          >
            <div class="min-w-0 flex-1">
              <MoleculesFormsEditableSimpleField
                class="menu-section-name-field"
                :label="displaySectionLabel(section)"
                :value="section.label"
                placeholder="Section name"
                :maxlength="160"
                :disabled="!canWrite"
                disabled-message="This menu is read-only."
                :validation-function="validateSectionLabel"
                :update="(value) => saveSectionLabel(section.id, value)"
              />
              <p v-if="section.description" class="text-sm text-dimmed">
                {{ section.description }}
              </p>
              <SectionDishes v-if="daily" :section-id="section.id" />
            </div>
            <UButton
              size="sm"
              variant="soft"
              icon="i-lucide-utensils"
              :to="`/workspace/kitchen/menus/${encodeURIComponent(menuSlug)}/${encodeURIComponent(section.id)}`"
            >
              Items
            </UButton>
          </article>
        </div>

        <p v-else class="text-sm text-dimmed">
          {{ daily ? 'Nothing planned for this date.' : 'No sections yet.' }}
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useState } from '#imports'
import MenuSchedule from '../Schedule.vue'
import SectionDishes from './Dishes.vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'

const {
  menu,
  source,
  menuId,
  menuSlug,
  kitchenId,
  sections,
  sectionsPending,
  canWrite,
  createSection,
  updateSection,
} = useKitchenMenuRecordContext()
const toast = useToastify()
const selectedDate = useState('kitchen-menu-calendar-date', () =>
  new Date().toLocaleDateString('en-CA')
)
const daily = computed(() => menu.value?.schedule === 'daily')
const formattedDate = computed(() =>
  /^\d{4}-\d{2}-\d{2}$/.test(selectedDate.value)
    ? new Date(`${selectedDate.value}T12:00:00Z`).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: 'UTC',
      })
    : 'Choose a date'
)
const visibleSections = computed(() =>
  daily.value
    ? sections.value.filter((section) => section.date === selectedDate.value)
    : sections.value
)
const text = (value: unknown) => String(value ?? '').trim()
const showCreateSection = ref(false)
const savingSection = ref(false)
const newSectionLabel = ref('')
const newSectionDescription = ref('')

const emptyTitle = computed(() => {
  if (sectionsPending.value) return 'Loading menu'
  if (source.value) return 'Menu draft not created yet'

  return 'Menu not found'
})
const emptyDescription = computed(() =>
  source.value
    ? 'Convert the uploaded source with AI to create menu sections and dishes.'
    : 'Choose an existing menu from the Menus page.'
)

const validateSectionLabel = (value: string) => ({
  isValid: Boolean(text(value)),
  message: text(value) ? '' : 'Section label is required.',
})

const displaySectionLabel = (section: { label?: unknown; id?: unknown }) =>
  text(section.label) || text(section.id) || 'Section'
const canCreateSection = computed(
  () =>
    canWrite.value &&
    Boolean(kitchenId.value && menuId.value && newSectionLabel.value.trim()) &&
    !savingSection.value
)

async function addSection() {
  if (!canCreateSection.value) return
  savingSection.value = true
  try {
    await createSection({
      kitchenId: kitchenId.value,
      menuId: menuId.value,
      label: text(newSectionLabel.value),
      description: text(newSectionDescription.value),
      sort_order: sections.value.length + 1,
    })
    newSectionLabel.value = ''
    newSectionDescription.value = ''
    showCreateSection.value = false
    toast.add({
      title: 'Section added',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    toast.add({
      title: 'Could not add section',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    savingSection.value = false
  }
}

async function saveSectionLabel(sectionId: string, value: string) {
  try {
    await updateSection(kitchenId.value, menuId.value, sectionId, {
      label: text(value),
    })
    toast.add({
      title: 'Section label saved',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    toast.add({
      title: 'Could not save section',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  }
}
</script>

<style scoped>
.menu-section-name-field :deep(.fx-field-surface) {
  display: none;
}
</style>
