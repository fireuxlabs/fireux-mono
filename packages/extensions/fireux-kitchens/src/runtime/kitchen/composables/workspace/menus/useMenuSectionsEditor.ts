import { menuLocalDate } from '../../../../menu/utils/daily-menu'
import { computed, ref } from 'vue'
import { useMenuEditorScope } from '../../../../menu/composables/useMenuEditorScope'
import { useState } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenMenuRecordContext } from './useKitchenMenuRecordContext'

export function useMenuSectionsEditor() {
  const {
    menu,
    timezone,
    source,
    menuId,
    menuSlug,
    kitchenId,
    sections,
    sectionsPending,
    sectionsError,
    canWrite,
    createSection,
    updateSection,
    moveSection,
  } = useKitchenMenuRecordContext()
  const toast = useToastify()
  const selectedDate = useState('kitchen-menu-calendar-date', () =>
    timezone.value ? menuLocalDate(timezone.value) : ''
  )
  const daily = computed(() => menu.value?.schedule === 'daily')
  const formattedDate = computed(() =>
    /^\d{4}-\d{2}-\d{2}$/.test(selectedDate.value)
      ? new Date(`${selectedDate.value}T12:00:00Z`).toLocaleDateString(
          'en-GB',
          {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            timeZone: 'UTC',
          }
        )
      : 'Choose a date'
  )
  const visibleSections = computed(() =>
    daily.value
      ? sections.value.filter((section) => section.date === selectedDate.value)
      : sections.value
  )
  const text = (value: unknown) => String(value ?? '').trim()
  const showCreateSection = ref(false)
  const moveError = ref('')
  const moving = ref('')
  const savingSection = ref(false)
  const newSectionLabel = ref('')
  const newSectionDescription = ref('')
  const captureScope = useMenuEditorScope(
    [kitchenId, menuId, selectedDate],
    () => {
      moving.value = ''
      moveError.value = ''
      savingSection.value = false
      showCreateSection.value = false
      newSectionLabel.value = ''
      newSectionDescription.value = ''
    }
  )

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
      Boolean(
        kitchenId.value && menuId.value && newSectionLabel.value.trim()
      ) &&
      !savingSection.value &&
      !sectionsPending.value &&
      !sectionsError.value
  )

  async function addSection() {
    if (!canCreateSection.value) return
    const isCurrent = captureScope()
    savingSection.value = true
    try {
      await createSection({
        kitchenId: kitchenId.value,
        menuId: menuId.value,
        label: text(newSectionLabel.value),
        description: text(newSectionDescription.value),
      })
      if (!isCurrent()) return
      newSectionLabel.value = ''
      newSectionDescription.value = ''
      showCreateSection.value = false
      toast.add({
        title: 'Section added',
        color: 'success',
        icon: 'i-lucide-check',
      })
    } catch (error) {
      if (!isCurrent()) return
      toast.add({
        title: 'Could not add section',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        color: 'error',
        icon: 'i-lucide-alert-triangle',
      })
    } finally {
      if (isCurrent()) savingSection.value = false
    }
  }

  async function saveSectionLabel(sectionId: string, value: string) {
    const isCurrent = captureScope()
    try {
      await updateSection(kitchenId.value, menuId.value, sectionId, {
        label: text(value),
      })
      if (!isCurrent()) return
      toast.add({
        title: 'Section label saved',
        color: 'success',
        icon: 'i-lucide-check',
      })
    } catch (error) {
      if (!isCurrent()) return
      toast.add({
        title: 'Could not save section',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        color: 'error',
        icon: 'i-lucide-alert-triangle',
      })
      throw error
    }
  }
  function canMove(sectionId: string, direction: 'up' | 'down') {
    const index = visibleSections.value.findIndex(
      (section) => section.id === sectionId
    )
    return (
      canWrite.value &&
      !moving.value &&
      index >= 0 &&
      (direction === 'up'
        ? index > 0
        : index < visibleSections.value.length - 1)
    )
  }
  async function move(sectionId: string, direction: 'up' | 'down') {
    if (!canMove(sectionId, direction)) return
    const isCurrent = captureScope()
    moveError.value = ''
    moving.value = sectionId
    try {
      await moveSection(
        kitchenId.value,
        menuId.value,
        sectionId,
        direction,
        isCurrent
      )
    } catch (error) {
      if (isCurrent())
        moveError.value =
          error instanceof Error
            ? error.message
            : 'Could not change the display order.'
    } finally {
      if (isCurrent()) moving.value = ''
    }
  }

  return {
    menu,
    menuSlug,
    sectionsPending,
    sectionsError,
    canWrite,
    selectedDate,
    daily,
    formattedDate,
    visibleSections,
    showCreateSection,
    moving,
    moveError,
    canMove,
    move,
    savingSection,
    newSectionLabel,
    newSectionDescription,
    emptyTitle,
    emptyDescription,
    validateSectionLabel,
    displaySectionLabel,
    canCreateSection,
    addSection,
    saveSectionLabel,
  }
}
