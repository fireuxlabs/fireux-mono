<template>
  <section
    v-if="view"
    class="kiosk-browse"
    aria-label="Kiosk browse"
  >
    <aside
      class="kiosk-browse__menu"
      aria-label="Menu"
    >
      <div class="kiosk-browse__groups" aria-label="Menu groups">
        <button
          v-for="group in groups"
          :key="group.id"
          type="button"
          class="kiosk-browse__group"
          :class="{ 'kiosk-browse__group--active': group.id === activeGroupId }"
          @click="chooseGroup(group.id)"
        >
          <span>{{ group.label }}</span>
        </button>
      </div>

      <div class="kiosk-browse__sections" aria-label="Sections">
        <button
          v-for="section in activeSections"
          :key="section.id"
          type="button"
          class="kiosk-browse__section"
          :class="{ 'kiosk-browse__section--active': section.id === activeSectionId }"
          @click="activeSectionId = section.id"
        >
          {{ section.label }}
        </button>
      </div>
    </aside>

    <main class="kiosk-browse__content" aria-label="Dishes">
      <section v-if="activeSection" class="kiosk-browse__dish-section">
        <header class="kiosk-browse__content-header">
          <h2>
            {{ activeSection.label }}
          </h2>
        </header>

        <div class="kiosk-browse__dishes">
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

  <p v-else class="kiosk-browse__empty">
    Menu unavailable.
  </p>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  MenuDetailOrderItem,
  MenuDetailView,
} from '../../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type {
  MenuManifestItem,
  MenuManifestSection,
} from '../../../../models/kitchen/menu/menu-detail.model'

type KioskGroupId = 'food' | 'drink' | 'deal'
type KioskGroup = {
  id: KioskGroupId
  label: string
  count: number
  sections: MenuManifestSection[]
}

const props = defineProps<{
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
.kiosk-browse {
  --kiosk-browse-columns: 10.5rem minmax(0, 1fr);
  --kiosk-browse-gap: 2.5rem;
  --kiosk-browse-padding: 24svh 2rem 2rem 0;
  --kiosk-dish-columns: repeat(3, minmax(0, 1fr));

  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: var(--kiosk-browse-columns);
  gap: var(--kiosk-browse-gap);
  width: 100%;
  height: 100svh;
  min-height: 0;
  padding: var(--kiosk-browse-padding);
  overflow: hidden;
  background: rgb(0 0 0 / 20%);
}

.kiosk-browse__menu,
.kiosk-browse__content {
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

.kiosk-browse__menu {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-left: 0.75rem;
  color: white;
}

.kiosk-browse__content-header h2 {
  margin: 0;
}

.kiosk-browse__groups,
.kiosk-browse__sections,
.kiosk-browse__dishes,
.kiosk-browse__dish-section {
  display: grid;
  gap: 0.75rem;
}

.kiosk-browse__sections {
  gap: 0.55rem;
  margin-top: 0.75rem;
}

.kiosk-browse__dishes {
  grid-template-columns: var(--kiosk-dish-columns);
  align-items: start;
}

.kiosk-browse__sections,
.kiosk-browse__content {
  overflow-y: auto;
}

.kiosk-browse__group,
.kiosk-browse__section {
  width: 100%;
  max-width: 9.75rem;
  border: 1px solid rgb(255 255 255 / 16%);
  border-radius: 0.5rem;
  background: rgb(0 0 0 / 38%);
  backdrop-filter: blur(16px);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 8%);
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  text-align: left;
}

.kiosk-browse__group {
  min-height: 3.25rem;
  padding: 0.7rem 0.7rem 0.7rem 0.85rem;
  font-size: 0.98rem;
}

.kiosk-browse__section {
  min-height: 2.7rem;
  padding: 0.58rem 0.65rem 0.58rem 0.78rem;
  background: rgb(0 0 0 / 28%);
  color: rgb(255 255 255 / 78%);
  font-size: 0.9rem;
}

.kiosk-browse__group--active {
  border-color: var(--kiosk-primary);
  background: var(--kiosk-primary);
  box-shadow: 0 0.65rem 1.4rem rgb(0 0 0 / 18%);
  color: white;
}

.kiosk-browse__section--active {
  border-color: color-mix(in srgb, var(--kiosk-primary) 62%, transparent);
  background: rgb(0 0 0 / 52%);
  box-shadow:
    inset 0.35rem 0 0 var(--kiosk-primary),
    inset 0 1px 0 rgb(255 255 255 / 8%);
  color: white;
}

.kiosk-browse__content {
  padding: 1.5rem;
  background: transparent;
  color: white;
}

.kiosk-browse__content-header {
  position: sticky;
  top: 0;
  z-index: 1;
  padding-bottom: 1rem;
  background: linear-gradient(
    rgb(0 0 0 / 28%),
    rgb(0 0 0 / 0%)
  );
}

.kiosk-browse__content-header h2 {
  color: white;
  font-size: 2.5rem;
  font-weight: 900;
  text-shadow: 0 0.35rem 1rem rgb(0 0 0 / 38%);
}

.kiosk-browse__empty {
  position: relative;
  z-index: 1;
  margin: 0;
  color: white;
  font-size: 2rem;
  font-weight: 900;
}

@media (max-width: 1100px) and (max-height: 900px) {
  .kiosk-browse {
    --kiosk-browse-columns: 9.5rem minmax(0, 1fr);
    --kiosk-browse-gap: 1.5rem;
    --kiosk-browse-padding: 22svh 1.25rem 1.25rem 0;
    --kiosk-dish-columns: repeat(auto-fill, minmax(12.5rem, 1fr));
  }

  .kiosk-browse__group,
  .kiosk-browse__section {
    max-width: 8.85rem;
  }
}

@media (max-width: 900px) {
  .kiosk-browse {
    --kiosk-browse-columns: 8.5rem minmax(0, 1fr);
    --kiosk-browse-gap: 1rem;
    --kiosk-browse-padding: 18svh 1rem 1rem 0;
    --kiosk-dish-columns: repeat(2, minmax(0, 1fr));
  }

  .kiosk-browse__group,
  .kiosk-browse__section {
    max-width: 7.85rem;
  }
}

@media (max-width: 640px) {
  .kiosk-browse {
    --kiosk-browse-columns: 1fr;
    --kiosk-browse-padding: 18svh 1rem 1rem;
    --kiosk-dish-columns: repeat(auto-fill, minmax(11.5rem, 1fr));

    grid-template-rows: auto minmax(0, 1fr);
  }

  .kiosk-browse__menu {
    gap: 0.5rem;
    padding-left: 0;
    overflow: visible;
  }

  .kiosk-browse__groups,
  .kiosk-browse__sections {
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
    padding-bottom: 0.2rem;
    scrollbar-width: none;
  }

  .kiosk-browse__groups::-webkit-scrollbar,
  .kiosk-browse__sections::-webkit-scrollbar {
    display: none;
  }

  .kiosk-browse__sections {
    margin-top: 0.15rem;
  }

  .kiosk-browse__group,
  .kiosk-browse__section {
    flex: 0 0 auto;
    width: auto;
    max-width: none;
    white-space: nowrap;
  }

  .kiosk-browse__group {
    min-height: 3rem;
    padding: 0.65rem 0.85rem;
  }

  .kiosk-browse__section {
    min-height: 2.55rem;
    padding: 0.55rem 0.75rem 0.55rem 0.9rem;
  }

  .kiosk-browse__content {
    padding: 0.35rem 0 0;
  }

  .kiosk-browse__content-header {
    position: static;
    padding-bottom: 0.75rem;
    background: transparent;
  }

  .kiosk-browse__content-header h2 {
    font-size: clamp(1.75rem, 6vw, 2.25rem);
  }

}

@media (max-width: 560px) {
  .kiosk-browse {
    --kiosk-browse-padding: 16svh 0.85rem 0.85rem;
    --kiosk-dish-columns: 1fr;
  }
}
</style>
