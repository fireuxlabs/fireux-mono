<template>
  <section class="space-y-6">
    <OrganismsMenuCollectionManager
      :collection="menuRows"
      title="Menus"
      description="Top-level menu records for the public menu index."
      :link="true"
    />

    <UCard v-if="menuRows.length">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="text-base font-semibold text-highlighted">
              Menu Order
            </div>
            <p class="text-sm text-dimmed">
              Arrange the public menu cards.
            </p>
          </div>

          <UBadge color="neutral" variant="soft">
            {{ menuRows.length }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-3">
        <article
          v-for="(menu, index) in menuRows"
          :key="menu.id"
          class="rounded-lg border border-transparent transition"
          :class="{
            'cursor-grab hover:border-default': canReorder,
            'opacity-60': draggedMenuId === menu.id,
          }"
          :draggable="canReorder"
          @dragstart="startDrag(menu.id)"
          @dragover.prevent
          @drop.prevent="dropMenu(index)"
          @dragend="endDrag"
        >
          <OrganismsMenuCardsPreview
            :title="menu.name || ''"
            :description="menu.description"
            :is-active-now="menu.active !== false"
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
                  aria-label="Move menu up"
                  :disabled="savingOrder || index === 0"
                  @click="moveMenu(index, -1)"
                />

                <UButton
                  v-if="canReorder"
                  type="button"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-arrow-down"
                  size="xs"
                  aria-label="Move menu down"
                  :disabled="savingOrder || index === menuRows.length - 1"
                  @click="moveMenu(index, 1)"
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

  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { Menu } from '../../../../../models/menu.model'

const props = withDefaults(
  defineProps<{
    collection?: Menu[]
    canWrite?: boolean
    collectionPath?: string
    databaseId?: string
  }>(),
  {
    collection: () => [],
    canWrite: false,
    collectionPath: '',
    databaseId: '',
  }
)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const toast = useToastify()
const resolveDb = useFirestoreResolver(computed(() => props.databaseId))
const draggedMenuId = ref('')
const menuRows = ref<Menu[]>([])
const savingOrder = ref(false)
const orderMessage = ref('')

const sortMenus = (menus: Menu[]) =>
  [...menus].sort(
    (a, b) =>
      Number(a?.sort_order || 0) - Number(b?.sort_order || 0) ||
      String(a?.name).localeCompare(String(b?.name))
  )

watch(
  () => props.collection,
  (nextCollection) => {
    if (draggedMenuId.value || savingOrder.value) return
    menuRows.value = sortMenus(nextCollection ?? [])
  },
  { immediate: true }
)

const canReorder = computed(
  () => props.canWrite && Boolean(normalizeString(props.collectionPath))
)

const startDrag = (menuId: unknown) => {
  if (!canReorder.value) return
  draggedMenuId.value = normalizeString(menuId)
}

const endDrag = () => {
  draggedMenuId.value = ''
}

const reorder = (fromIndex: number, toIndex: number) => {
  if (!canReorder.value || fromIndex === toIndex) return
  if (fromIndex < 0 || toIndex < 0) return
  if (fromIndex >= menuRows.value.length || toIndex >= menuRows.value.length) return

  const next = [...menuRows.value]
  const [moved] = next.splice(fromIndex, 1)
  if (!moved) return

  next.splice(toIndex, 0, moved)
  menuRows.value = next
  void saveOrder()
}

const dropMenu = (toIndex: number) => {
  const fromIndex = menuRows.value.findIndex(
    (menu) => normalizeString(menu.id) === draggedMenuId.value
  )
  endDrag()
  reorder(fromIndex, toIndex)
}

const moveMenu = (index: number, delta: number) => {
  reorder(index, index + delta)
}

async function saveOrder() {
  if (!canReorder.value || savingOrder.value) return

  savingOrder.value = true
  orderMessage.value = 'Saving order...'

  try {
    const user = await useRequireUser()
    const db = resolveDb()
    const batch = writeBatch(db)

    menuRows.value.forEach((menu, index) => {
      const menuId = normalizeString(menu.id)
      if (!menuId) return

      batch.set(
        doc(db, props.collectionPath, menuId),
        {
          sort_order: (index + 1) * 10,
          updated: {
            at: serverTimestamp() as any,
            by: user.uid,
          },
        },
        { merge: true }
      )
    })

    await batch.commit()
    orderMessage.value = 'Order saved.'
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    orderMessage.value = description
    toast.add({
      title: 'Failed to save menu order',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    savingOrder.value = false
  }
}
</script>
