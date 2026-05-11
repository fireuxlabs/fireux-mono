<template>
  <div class="space-y-6">
    <UButton
      to="/console/kitchen/menus"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to menus
    </UButton>

    <UAlert
      v-if="!menu"
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading menu' : 'Menu not found'"
      :description="
        pending
          ? 'Fetching the selected kitchen menu.'
          : `No menu was found for ${menuId || 'this route'}.`
      "
    />

    <UCard v-else>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Sections</h2>
            <p v-if="menu.name">{{ menu.name }}</p>
          </div>

          <div class="collection-manager__controls flex flex-1 items-center gap-2">
            <div class="ml-auto flex items-center gap-2">
              <UInput
                v-if="showSearchInput"
                v-model="query"
                size="xs"
                placeholder="Search sections..."
              />

              <UButton
                size="xs"
                variant="ghost"
                :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
                :aria-label="
                  variant === 'pill'
                    ? 'Switch to list view'
                    : 'Switch to grid view'
                "
                @click="toggleVariant"
              />

              <UBadge variant="soft">
                {{ countLabel }}
              </UBadge>
            </div>
          </div>
        </div>
      </template>

      <OrganismsMenuCollectionList
        v-if="visibleSectionCards.length"
        :cards="visibleSectionCards"
        :variant="variant"
      >
        <template #pill="{ card }">
          <OrganismsMenuCardsPill v-bind="card" :link="true" />
        </template>

        <template #cell="{ card }">
          <OrganismsMenuCardsCell v-bind="card" :link="true" />
        </template>
      </OrganismsMenuCollectionList>

      <p v-else class="text-sm text-dimmed">
        {{ query ? 'No sections match your search.' : 'No sections found.' }}
      </p>

      <DevJson
        v-if="isDev"
        title="Sections (JSON)"
        context="collection manager · menu sections"
        :data="devJsonData"
        :default-open="false"
      />
    </UCard>

    <UCard v-if="sectionRows.length">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-base font-semibold text-highlighted">
              Section Order
            </div>
            <p class="text-sm text-dimmed">
              Arrange how sections appear in this menu.
            </p>
          </div>

          <UBadge color="neutral" variant="soft">
            {{ sectionRows.length }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-3">
        <article
          v-for="(section, index) in sectionRows"
          :key="section.id"
          class="rounded-lg border border-transparent transition"
          :class="{
            'cursor-grab hover:border-default': canReorder,
            'opacity-60': draggedSectionId === section.id,
          }"
          :draggable="canReorder"
          @dragstart="startDrag(section.id)"
          @dragover.prevent
          @drop.prevent="dropSection(index)"
          @dragend="endDrag"
        >
          <OrganismsMenuCardsPreview
            :title="section.label"
            :description="section.description"
            icon="i-lucide-list-tree"
            :is-active-now="true"
            :movable="canReorder"
            :show-badges="false"
            :details="[]"
          >
            <template #actions>
              <div class="flex flex-col items-center justify-center gap-1">
                <UButton
                  v-if="canReorder"
                  type="button"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-arrow-up"
                  size="xs"
                  aria-label="Move section up"
                  :disabled="savingOrder || index === 0"
                  @click="moveSection(index, -1)"
                />

                <UButton
                  v-if="canReorder"
                  type="button"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-arrow-down"
                  size="xs"
                  aria-label="Move section down"
                  :disabled="savingOrder || index === sectionRows.length - 1"
                  @click="moveSection(index, 1)"
                />
              </div>
            </template>
          </OrganismsMenuCardsPreview>
        </article>
      </div>

      <p v-if="orderMessage" class="mt-3 text-xs text-dimmed">
        {{ orderMessage }}
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { MenuSection } from '../../../../../../models/menu.model'
import { useKitchenConsoleMenu } from '../../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleMenu'
import type { MenuCard } from '../../../../../../composables/fireux/firestore/runtime-kitchen/menu/utils/view/useMenuInterface'

const {
  menu,
  menuId,
  pending,
  collectionPath,
  databaseId,
  canWrite,
} = useKitchenConsoleMenu()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const numberValue = (value: unknown, fallback = 0) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}
const sortSections = (items: MenuSection[]) =>
  [...items].sort(
    (a, b) =>
      numberValue(a?.sort_order) - numberValue(b?.sort_order) ||
      normalizeString(a?.label).localeCompare(normalizeString(b?.label))
  )

const toast = useToastify()
const resolveDb = useFirestoreResolver(databaseId)
const query = ref('')
const variant = ref<'pill' | 'cell'>('pill')
const draggedSectionId = ref('')
const sectionRows = ref<MenuSection[]>([])
const savingOrder = ref(false)
const orderMessage = ref('')
const queryNormalized = computed(() => normalizeString(query.value).toLowerCase())
const sections = computed(() => sectionRows.value)
const { devJsonData } = useDevCollectionJson(sections)
const isDev = import.meta.dev
const showSearchInput = computed(() => sections.value.length > 8)
const visibleSections = computed(() => {
  const search = queryNormalized.value
  if (!search) return sections.value

  return sections.value.filter((section) =>
    [section.label, section.description]
      .map((value) => normalizeString(value).toLowerCase())
      .join(' ')
      .includes(search)
  )
})
const sectionCards = computed<MenuCard.Card[]>(() =>
  sections.value.map((section) => {
    const itemCount = Array.isArray(section.items) ? section.items.length : 0
    const itemLabel = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`
    const title = normalizeString(section.label)
    const description = normalizeString(section.description)

    return {
      id: normalizeString(section.id),
      to: sectionTo(section.id),
      imageUrl: '',
      title,
      subtitle: description,
      meta: itemLabel,
      status: 'active',
      badges: [itemLabel],
      summary: description,
      name: title,
      description: '',
      active: true,
      itemCount,
      isActiveNow: true,
      windowLabel: '',
      sortOrder: numberValue(section.sort_order),
    }
  })
)
const visibleSectionCards = computed(() => {
  const visibleIds = new Set(visibleSections.value.map((section) => normalizeString(section.id)))
  return sectionCards.value.filter((card) => visibleIds.has(card.id))
})
const countLabel = computed(() =>
  queryNormalized.value
    ? `${visibleSections.value.length} / ${sections.value.length}`
    : `${sections.value.length}`
)

const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

const sectionTo = (sectionId: MenuSection['id']) =>
  `/console/kitchen/menus/${encodeURIComponent(menuId.value)}/${encodeURIComponent(
    normalizeString(sectionId)
  )}`

watch(
  () => menu.value?.sections,
  (nextSections) => {
    if (draggedSectionId.value || savingOrder.value) return
    sectionRows.value = sortSections(Array.isArray(nextSections) ? nextSections : [])
  },
  { immediate: true }
)

const canReorder = computed(
  () =>
    canWrite.value &&
    !savingOrder.value &&
    Boolean(normalizeString(collectionPath.value)) &&
    Boolean(normalizeString(menuId.value))
)

const startDrag = (sectionId: unknown) => {
  if (!canReorder.value) return
  draggedSectionId.value = normalizeString(sectionId)
}

const endDrag = () => {
  draggedSectionId.value = ''
}

const reorder = (fromIndex: number, toIndex: number) => {
  if (!canReorder.value || fromIndex === toIndex) return
  if (fromIndex < 0 || toIndex < 0) return
  if (fromIndex >= sectionRows.value.length || toIndex >= sectionRows.value.length) return

  const next = [...sectionRows.value]
  const [moved] = next.splice(fromIndex, 1)
  if (!moved) return

  next.splice(toIndex, 0, moved)
  sectionRows.value = next
  void saveOrder()
}

const dropSection = (toIndex: number) => {
  const fromIndex = sectionRows.value.findIndex(
    (section) => normalizeString(section.id) === draggedSectionId.value
  )
  endDrag()
  reorder(fromIndex, toIndex)
}

const moveSection = (index: number, delta: number) => {
  reorder(index, index + delta)
}

async function saveOrder() {
  if (!canReorder.value || savingOrder.value) return

  savingOrder.value = true
  orderMessage.value = 'Saving order...'

  try {
    const user = await useRequireUser()
    const db = resolveDb()
    const sectionsOrdered = sectionRows.value.map((section, index) => ({
      ...section,
      sort_order: (index + 1) * 10,
    }))

    await setDoc(
      doc(db, collectionPath.value, menuId.value),
      {
        sections: sectionsOrdered,
        updated: {
          at: serverTimestamp() as any,
          by: user.uid,
        },
      },
      { merge: true }
    )

    sectionRows.value = sectionsOrdered
    orderMessage.value = 'Order saved.'
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    orderMessage.value = description
    toast.add({
      title: 'Failed to save section order',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    savingOrder.value = false
  }
}
</script>
