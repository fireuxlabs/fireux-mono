<template>
  <div class="space-y-4">
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
            <h2 class="text-base font-semibold text-highlighted">Menu sections</h2>
            <p class="text-sm text-dimmed">
              {{ menu.description || 'Build the public menu from sections and dish-backed items.' }}
            </p>
          </div>
          <UButton
            size="sm"
            color="neutral"
            variant="soft"
            :icon="showCreateSection ? 'i-lucide-minus' : 'i-lucide-plus'"
            :aria-label="showCreateSection ? 'Hide section fields' : 'Add section'"
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

        <div v-if="sections.length" class="space-y-3">
          <article
            v-for="section in sections"
            :key="section.id"
            class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-default bg-default p-3"
          >
            <div class="min-w-0 flex-1">
              <MoleculesFormsFirestoreSimpleField
                class="menu-section-name-field"
                :label="displaySectionLabel(section)"
                :firebase-value="section.label"
                placeholder="Section name"
                :maxlength="160"
                :disabled="!canWrite"
                disabled-message="This menu is read-only."
                :validation-function="validateSectionLabel"
                :update-function="(value) => saveSectionLabel(section.id, value)"
              />
              <p v-if="section.description" class="text-sm text-dimmed">
                {{ section.description }}
              </p>
            </div>
            <UButton
              size="sm"
              variant="soft"
              icon="i-lucide-utensils"
              :to="`/console/kitchen/menus/${encodeURIComponent(menuId)}/${encodeURIComponent(section.id)}`"
            >
              Items
            </UButton>
          </article>
        </div>

        <p v-else class="text-sm text-dimmed">
          No sections yet. Use the plus button to add one before publishing.
        </p>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenu } from '../../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'

const {
  menu,
  source,
  menuId,
  kitchenId,
  sections,
  sectionsPending,
  canWrite,
  createSection,
  updateSection,
} = useKitchenConsoleMenu()
const toast = useToastify()
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

const displaySectionLabel = (section: { label?: unknown, id?: unknown }) =>
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
    toast.add({ title: 'Section added', color: 'success', icon: 'i-lucide-check' })
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
    await updateSection(kitchenId.value, menuId.value, sectionId, { label: text(value) })
    toast.add({ title: 'Section label saved', color: 'success', icon: 'i-lucide-check' })
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
