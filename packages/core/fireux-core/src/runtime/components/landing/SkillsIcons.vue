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
  padding: clamp(2rem, 6vw, 3rem) 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  gap: 1rem;
}

.skills__icons li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  background: var(--ui-surface-subtle);
  color: var(--ui-text);
}

.skills__icons li i,
.skills__icons li svg {
  font-size: 1.5rem;
}
</style>
