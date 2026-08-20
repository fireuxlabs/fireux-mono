<template>
  <section
    class="misebox-handoff"
    aria-label="Misebox guest Menu and Kitchen Workspace demonstration"
  >
    <div class="misebox-handoff__chapters" aria-label="Product workflow">
      <button
        v-for="chapter in chapters"
        :key="chapter.id"
        type="button"
        :aria-pressed="selectedChapter === chapter.id"
        @click="selectChapter(chapter.id)"
      >
        <UIcon :name="chapter.icon" aria-hidden="true" />
        <span>{{ chapter.label }}</span>
      </button>
    </div>

    <Suspense>
      <MiseboxLandingHandoffStage :selected-chapter="selectedChapter" />

      <template #fallback>
        <MiseboxLandingHandoffState />
      </template>
    </Suspense>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MiseboxLandingHandoffStage from './HandoffStage.vue'
import MiseboxLandingHandoffState from './HandoffState.vue'

type HandoffChapter = 'publish' | 'prepare' | 'serve'

const chapters = [
  {
    id: 'publish',
    label: 'Publish',
    icon: 'i-lucide-qr-code',
    signal: 'Menu published',
    workspaceLabel: 'Menus',
  },
  {
    id: 'prepare',
    label: 'Prepare',
    icon: 'i-lucide-list-checks',
    signal: 'Prep connected',
    workspaceLabel: 'Mise en place',
  },
  {
    id: 'serve',
    label: 'Serve',
    icon: 'i-lucide-bell-ring',
    signal: 'Order received',
    workspaceLabel: 'Orders',
  },
] as const

const selectedChapter = ref<HandoffChapter>('publish')

function selectChapter(chapter: HandoffChapter) {
  selectedChapter.value = chapter
}
</script>

<style scoped src="./handoff-preview.css"></style>
