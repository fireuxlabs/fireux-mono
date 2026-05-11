<template>
  <UCard v-if="draft">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="text-base font-semibold text-highlighted">
            Section Tools
          </div>
          <p class="text-sm text-dimmed">
            Add, rename, remove, and reorder sections for this menu.
          </p>
        </div>
      </div>
    </template>

    <div
      v-if="canWrite"
      class="rounded-lg border border-dashed border-default p-3"
    >
      <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
        <UInput
          v-model="newSectionLabel"
          placeholder="New section label"
          :disabled="saving"
        />
        <UButton
          type="button"
          icon="i-lucide-plus"
          :disabled="saving || !newSectionLabel.trim()"
          @click="addSection"
        >
          Add section
        </UButton>
      </div>
    </div>

    <details class="mt-4 rounded-lg border border-default p-4">
      <summary class="cursor-pointer select-none text-sm font-semibold text-highlighted">
        Edit section labels
      </summary>

      <div class="mt-4 space-y-3">
        <article
          v-for="(section, index) in draft.sections"
          :key="section.local_key"
          class="rounded-lg border border-default bg-default p-3"
        >
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div
              v-if="section.label"
              class="text-sm font-medium text-highlighted"
            >
              {{ section.label }}
            </div>

            <div class="flex items-center gap-1">
              <UButton
                type="button"
                color="error"
                variant="ghost"
                icon="i-lucide-trash-2"
                size="xs"
                aria-label="Delete section"
                :disabled="!canWrite || saving"
                @click="deleteSection(index)"
              />
            </div>
          </div>

          <UFormField label="Label">
            <UInput
              v-model="section.label"
              :disabled="!canWrite || saving"
            />
          </UFormField>

          <UFormField label="Description" class="mt-3">
            <UTextarea
              v-model="section.description"
              :rows="2"
              :disabled="!canWrite || saving"
            />
          </UFormField>
        </article>
      </div>
    </details>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <UButton
        type="button"
        icon="i-lucide-save"
        :loading="saving"
        :disabled="!canSave"
        @click="saveMenu"
      >
        Save sections
      </UButton>

      <p v-if="message" class="text-sm text-dimmed">
        {{ message }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Menu, MenuSection } from '../../../../../../models/menu.model'
import { useKitchenConsoleMenu } from '../../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenu'

type SectionDraft = {
  local_key: string
  raw: MenuSection
  id: string
  label: string
  description: string
  sort_order: number
  items: MenuSection['items']
}

type MenuDraft = {
  name: string
  description: string
  active: boolean
  sections: SectionDraft[]
}

const {
  kitchenId,
  collectionPath,
  databaseId,
  canWrite,
  menuId,
  menu,
} = useKitchenConsoleMenu()

const resolveDb = useFirestoreResolver(databaseId)
const toast = useToastify()
const draft = ref<MenuDraft | null>(null)
const saving = ref(false)
const message = ref('')
const newSectionLabel = ref('')
let localCounter = 0

const normalizeString = (value: unknown) => String(value ?? '').trim()
const nextLocalKey = () => `section-${Date.now()}-${localCounter++}`
const numberValue = (value: unknown, fallback = 0) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

const slugify = (value: unknown, fallback: string) => {
  const slug = normalizeString(value)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

const uniqueId = (base: string, used: Set<string>) => {
  let id = base
  let index = 2

  while (used.has(id)) {
    id = `${base}-${index}`
    index += 1
  }

  used.add(id)
  return id
}

const sortedSections = (sections: MenuSection[]) =>
  [...sections].sort(
    (a, b) =>
      numberValue(a?.sort_order) - numberValue(b?.sort_order) ||
      normalizeString(a?.label).localeCompare(normalizeString(b?.label))
  )

const sectionToDraft = (section: MenuSection): SectionDraft => ({
  local_key: nextLocalKey(),
  raw: { ...section, items: Array.isArray(section.items) ? [...section.items] : [] },
  id: normalizeString(section.id),
  label: normalizeString(section.label),
  description: normalizeString(section.description),
  sort_order: numberValue(section.sort_order),
  items: Array.isArray(section.items) ? [...section.items] : [],
})

const menuToDraft = (source: Menu): MenuDraft => ({
  name: normalizeString(source.name),
  description: normalizeString(source.description),
  active: source.active !== false,
  sections: sortedSections(Array.isArray(source.sections) ? source.sections : []).map(
    sectionToDraft
  ),
})

watch(
  menu,
  (nextMenu) => {
    draft.value = nextMenu ? menuToDraft(nextMenu) : null
  },
  { immediate: true }
)

const canSave = computed(
  () =>
    canWrite.value &&
    !saving.value &&
    Boolean(collectionPath.value) &&
    Boolean(menuId.value) &&
    Boolean(draft.value?.name.trim())
)

function addSection() {
  if (!draft.value) return

  const label = normalizeString(newSectionLabel.value)
  if (!label) return

  const nextOrder = draft.value.sections.length
    ? Math.max(...draft.value.sections.map((section) => numberValue(section.sort_order))) + 10
    : 10
  const id = slugify(label, 'section')
  const section: MenuSection = {
    id,
    label,
    description: '',
    items: [],
    sort_order: nextOrder,
  }

  draft.value.sections.push(sectionToDraft(section))
  newSectionLabel.value = ''
}

function deleteSection(index: number) {
  if (!draft.value) return
  if (typeof window !== 'undefined' && !window.confirm('Delete this section?')) return

  draft.value.sections.splice(index, 1)
}

function draftToPatch(source: MenuDraft): Partial<Menu> {
  const sectionIds = new Set<string>()
  const sections = source.sections.map<MenuSection>((section) => {
    const id = uniqueId(slugify(section.id || section.label, 'section'), sectionIds)

    return {
      ...section.raw,
      id,
      label: normalizeString(section.label) || id,
      description: normalizeString(section.description),
      sort_order: numberValue(section.sort_order),
      items: section.items,
    }
  })

  return {
    name: normalizeString(source.name),
    description: normalizeString(source.description),
    active: source.active !== false,
    sections,
  }
}

async function saveMenu() {
  if (!draft.value || !canSave.value) return

  saving.value = true
  message.value = ''

  try {
    const user = await useRequireUser()
    const payload: Partial<Menu> = {
      kitchen_id: kitchenId.value,
      ...draftToPatch(draft.value),
      updated: {
        at: serverTimestamp() as any,
        by: user.uid,
      },
    }

    await setDoc(doc(resolveDb(), collectionPath.value, menuId.value), payload, {
      merge: true,
    })

    message.value = 'Saved.'
    toast.add({ title: 'Sections saved', icon: 'i-heroicons-check-circle' })
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    message.value = description
    toast.add({
      title: 'Failed to save sections',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    saving.value = false
  }
}
</script>
