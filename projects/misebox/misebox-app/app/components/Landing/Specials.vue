<template>
  <section
    v-if="collection.length || error"
    aria-label="Kitchen specials"
    class="entity-collection"
  >
    <UAlert
      v-if="error"
      title="Specials are temporarily unavailable"
      color="neutral"
      variant="soft"
    />
    <UPageGrid v-else>
      <UPageCard
        v-for="menu in specials"
        :key="menu.id"
        :title="`🎟️ ${menu.special?.today ? 'Today’s special' : 'Upcoming special'} · ${menu.kitchen?.name || menu.source?.kitchen_name}`"
        :description="`${formatDate(menu.special!.date)} · ${menu.description || menu.name}`"
        :to="menuLink(menu.id)"
      />
    </UPageGrid>
    <UButton
      v-if="error"
      label="Try again"
      color="neutral"
      variant="soft"
      @click="refresh()"
    />
    <UButton
      v-if="hasMore"
      label="More specials"
      color="neutral"
      variant="soft"
      :loading="loadingMore"
      @click="loadMore()"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useMenuDirectory } from 'fireux-kitchens/runtime/menu/composables/useMenuDirectory'

const { collection, error, menuLink, hasMore, loadingMore, loadMore, refresh } =
  useMenuDirectory({ specials: true })
const specials = computed(() =>
  [...collection.value].sort((a, b) =>
    a.special!.date.localeCompare(b.special!.date)
  )
)
let midnightTimer: ReturnType<typeof setTimeout> | undefined
const scheduleRefresh = () => {
  clearTimeout(midnightTimer)
  const boundaries = collection.value
    .map((menu) => menu.special?.nextChangeAt)
    .filter((value): value is number => typeof value === 'number')
  if (boundaries.length)
    midnightTimer = setTimeout(
      () => {
        void refresh()
      },
      Math.max(1000, Math.min(...boundaries) - Date.now())
    )
}
onMounted(scheduleRefresh)
watch(collection, scheduleRefresh)
onUnmounted(() => clearTimeout(midnightTimer))
const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
</script>
