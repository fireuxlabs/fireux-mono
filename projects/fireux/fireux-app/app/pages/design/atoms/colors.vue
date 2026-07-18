<!-- COMMENT: app/pages/design/atoms/colors.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'design' })

const colorGroups = {
  brandColors: ['--ui-primary', '--ui-secondary'],
  statusColors: ['--ui-info', '--ui-success', '--ui-warning', '--ui-error'],
  uiColors: [
    '--ui-bg',
    '--ui-bg-muted',
    '--ui-bg-elevated',
    '--ui-border',
    '--ui-border-muted',
    '--ui-border-accented',
  ],
}

type ColorItem = { group: string; name: string }

const colorValues = ref<ColorItem[]>([])

onMounted(() => {
  const colors: ColorItem[] = []

  Object.entries(colorGroups).forEach(([group, vars]) => {
    ;(vars as string[]).forEach((varName: string) => {
      colors.push({ group, name: varName })
    })
  })

  colorValues.value = colors
})
</script>

<template>
  <div class="design">
    <div class="grid">
      <div v-for="color in colorValues" :key="color.name" class="color-item">
        <div
          class="color-block"
          :style="{ backgroundColor: `var(${color.name})` }"
        />
        <div class="color-header">{{ color.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ✅ Center Page */
.design {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

/* ✅ Grid Layout */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

/* ✅ Card-Style Container */
.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: var(--ui-bg-elevated);
  border-radius: calc(var(--ui-radius) * 2);
  padding: 1rem;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
}

/* ✅ Card Header */
.color-header {
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* ✅ Color Block */
.color-block {
  width: 100%;
  height: 100px;
  border-radius: calc(var(--ui-radius) * 1.5);
  border: 1px solid var(--ui-border-muted);
}
</style>
