<template>
  <section
    v-if="calendarReady"
    class="mx-auto grid w-full max-w-5xl gap-8 py-2"
  >
    <header class="grid gap-3 border-b border-default pb-8">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Calendar
      </p>
      <h1 class="m-0 text-3xl font-semibold text-highlighted">
        {{ selectedDateLabel }}
      </h1>
      <p class="m-0 max-w-3xl text-base text-muted">
        Project Calendar starts on today and can move through dates. Project
        milestones, reviews, launches and maintenance will appear here only when
        their owning capabilities provide time-bound evidence.
      </p>
      <div class="flex flex-wrap items-center gap-2 pt-2">
        <UButton
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="soft"
          aria-label="Previous day"
          @click="moveDay(-1)"
        />
        <UInput
          v-model="selectedDate"
          type="date"
          aria-label="Calendar date"
          class="w-44"
        />
        <UButton
          icon="i-lucide-chevron-right"
          color="neutral"
          variant="soft"
          aria-label="Next day"
          @click="moveDay(1)"
        />
        <UButton
          v-if="selectedDate !== todayKey"
          color="neutral"
          variant="ghost"
          @click="showToday"
        >
          Today
        </UButton>
      </div>
    </header>

    <UAlert
      color="neutral"
      variant="soft"
      icon="i-lucide-calendar-range"
      title="No scheduled Project work"
      description="This date has no time-bound Project evidence. Calendar does not invent events from Project identity, Apps or Ecosystem decisions."
    />
  </section>
  <UAlert
    v-else-if="workspace.outcome.value !== 'pending'"
    color="neutral"
    variant="soft"
    icon="i-lucide-lock-keyhole"
    title="Project onboarding required"
    description="Calendar becomes available when the selected Project completes onboarding and its canonical root becomes active."
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProjectWorkspace } from '../../../composables/workspace/core/useProjectWorkspace'

const workspace = useProjectWorkspace()
const calendarReady = computed(
  () => workspace.data.value?.status === 'active'
)
const today = new Date()
const dateKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
const todayKey = dateKey(today)
const selectedDate = ref(todayKey)
const selectedDateLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${selectedDate.value}T12:00:00`))
)

function moveDay(delta: number) {
  const date = new Date(`${selectedDate.value}T12:00:00`)
  date.setDate(date.getDate() + delta)
  selectedDate.value = dateKey(date)
}

function showToday() {
  selectedDate.value = todayKey
}
</script>
