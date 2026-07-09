<template>
  <section
    v-if="view"
    class="kiosk-order"
    aria-label="Kiosk layout"
  >
    <aside
      class="kiosk-order__menu"
      aria-label="Menu"
    >
      <p class="kiosk-order__mode">
        {{ modeLabel }}
      </p>

      <div class="kiosk-order__groups" aria-label="Menu groups">
        <button
          v-for="group in groups"
          :key="group.id"
          type="button"
          class="kiosk-order__group"
          :class="{ 'kiosk-order__group--active': group.id === activeGroupId }"
          @click="chooseGroup(group.id)"
        >
          <span>{{ group.label }}</span>
        </button>
      </div>

      <div class="kiosk-order__sections" aria-label="Sections">
        <button
          v-for="section in activeSections"
          :key="section.id"
          type="button"
          class="kiosk-order__section"
          :class="{ 'kiosk-order__section--active': section.id === activeSectionId }"
          @click="activeSectionId = section.id"
        >
          {{ section.label }}
        </button>
      </div>
    </aside>

    <main class="kiosk-order__content" aria-label="Dishes">
      <section v-if="activeSection" class="kiosk-order__dish-section">
        <header class="kiosk-order__content-header">
          <h2>
            {{ activeSection.label }}
          </h2>
        </header>

        <div class="kiosk-order__dishes">
          <MenuDetailKioskItem
            v-for="item in activeSection.items"
            :key="item.id"
            :item="item"
            @add="emit('add', $event)"
          />
        </div>
      </section>
    </main>
  </section>

  <p v-else class="kiosk-order__empty">
    Menu unavailable.
  </p>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  MenuDetailOrderItem,
  MenuDetailView,
} from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type {
  MenuManifestItem,
  MenuManifestSection,
} from '../../../models/kitchen/menu/menu-detail.model'

type KioskGroupId = 'food' | 'drink' | 'deal'
type KioskGroup = {
  id: KioskGroupId
  label: string
  count: number
  sections: MenuManifestSection[]
}

const props = defineProps<{
  mode?: 'eat_in' | 'takeaway' | ''
  view: MenuDetailView | null
}>()

const emit = defineEmits<{
  (event: 'add', item: MenuDetailOrderItem): void
}>()

const groupOrder: Array<{ id: KioskGroupId, label: string }> = [
  { id: 'food', label: 'Food' },
  { id: 'drink', label: 'Drinks' },
  { id: 'deal', label: 'Deals' },
]
const activeGroupId = ref<KioskGroupId>('food')
const activeSectionId = ref('')
const itemGroup = (item: MenuManifestItem): KioskGroupId => {
  if (item.isDeal) return 'deal'
  return item.itemKind === 'drink' ? 'drink' : 'food'
}
const groups = computed<KioskGroup[]>(() =>
  groupOrder
    .map((group) => {
      const sections = (props.view?.menu.content.sections ?? [])
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => itemGroup(item) === group.id),
        }))
        .filter((section) => section.items.length)
      const count = sections.reduce((total, section) => total + section.items.length, 0)

      return { ...group, count, sections }
    })
    .filter((group) => group.count)
)
const activeGroup = computed(() =>
  groups.value.find((group) => group.id === activeGroupId.value) ??
    groups.value.find((group) => group.count) ??
    groups.value[0]
)
const activeSections = computed(() => activeGroup.value?.sections ?? [])
const activeSection = computed(() =>
  activeSections.value.find((section) => section.id === activeSectionId.value) ??
    activeSections.value[0] ??
    null
)
const modeLabel = computed(() =>
  props.mode === 'eat_in'
    ? 'Eat in'
    : props.mode === 'takeaway'
      ? 'Takeaway'
      : 'Kiosk'
)
const chooseGroup = (groupId: KioskGroupId) => {
  activeGroupId.value = groupId
  activeSectionId.value = ''
}

watch(groups, (nextGroups) => {
  const current = nextGroups.find((group) => group.id === activeGroupId.value)
  if (current?.count) return

  const firstAvailable = nextGroups.find((group) => group.count)
  if (firstAvailable) activeGroupId.value = firstAvailable.id
}, { immediate: true })

watch(activeSections, (sections) => {
  if (sections.some((section) => section.id === activeSectionId.value)) return

  activeSectionId.value = sections[0]?.id || ''
}, { immediate: true })
</script>

<style scoped>
.kiosk-order {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 18rem minmax(0, 1fr);
  gap: 1.5rem;
  width: 100%;
  height: 100svh;
  min-height: 0;
  padding: 30svh 2rem 2rem 0;
  overflow: hidden;
  background: rgb(0 0 0 / 20%);
}

.kiosk-order__menu,
.kiosk-order__content {
  min-height: 0;
  overflow: hidden;
}

.kiosk-order__menu {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgb(0 0 0 / 68%);
  color: white;
}

.kiosk-order__mode,
.kiosk-order__content-header h2 {
  margin: 0;
}

.kiosk-order__mode {
  color: rgb(255 255 255 / 70%);
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
}

.kiosk-order__groups,
.kiosk-order__sections,
.kiosk-order__dishes,
.kiosk-order__dish-section {
  display: grid;
  gap: 0.75rem;
}

.kiosk-order__dishes {
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  align-items: start;
}

.kiosk-order__sections,
.kiosk-order__content {
  overflow-y: auto;
}

.kiosk-order__group,
.kiosk-order__section {
  width: 100%;
  border: 1px solid rgb(255 255 255 / 18%);
  background: rgb(255 255 255 / 8%);
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  text-align: left;
}

.kiosk-order__group {
  min-height: 4rem;
  padding: 0.9rem 1rem;
  font-size: 1.25rem;
}

.kiosk-order__section {
  min-height: 3.5rem;
  padding: 0.75rem;
  color: rgb(255 255 255 / 76%);
}

.kiosk-order__group--active,
.kiosk-order__section--active {
  border-color: var(--kiosk-primary);
  background: rgb(255 255 255 / 16%);
  color: white;
}

.kiosk-order__content {
  padding: 1.5rem;
  background: rgb(255 255 255 / 90%);
  color: #18181b;
}

.kiosk-order__content-header {
  position: sticky;
  top: 0;
  z-index: 1;
  padding-bottom: 1rem;
  background: rgb(255 255 255 / 90%);
}

.kiosk-order__content-header h2 {
  color: #18181b;
  font-size: 2.5rem;
  font-weight: 900;
}

.kiosk-order__empty {
  position: relative;
  z-index: 1;
  margin: 0;
  color: white;
  font-size: 2rem;
  font-weight: 900;
}
</style>
