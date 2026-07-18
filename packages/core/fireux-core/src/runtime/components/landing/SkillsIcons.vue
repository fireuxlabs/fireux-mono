<template>
  <section class="skills">
    <header>
      <h2>Stacks we play nicely with</h2>
      <p>Shared defaults that keep the landing shell useful before bespoke polish.</p>
    </header>

    <ul class="skills__icons">
      <li v-for="skill in resolvedSkills" :key="skill.label">
        <UIcon :name="skill.icon" />
        <span>{{ skill.label }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  skills?: Array<{
    icon: string
    label: string
  }>
}>()

const resolvedSkills = computed(
  () =>
    props.skills || [
      { icon: 'i-simple-icons-nuxtdotjs', label: 'Nuxt 4' },
      { icon: 'i-simple-icons-firebase', label: 'Firebase' },
      { icon: 'i-simple-icons-typescript', label: 'TypeScript' },
      { icon: 'i-simple-icons-vuedotjs', label: 'Vue' },
    ]
)
</script>

<style scoped>
.skills {
  padding: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 12)) 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
}

.skills header h2 {
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
  font-weight: 700;
}

.skills header p {
  color: var(--ui-text-muted);
}

.skills__icons {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 4);
}

.skills__icons li {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  color: var(--ui-text);
}

.skills__icons li i,
.skills__icons li svg {
  font-size: 1.5rem;
}
</style>
