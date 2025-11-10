<template>
  <section class="skills">
    <header class="skills__header">
      <h2>Chef roster sync</h2>
      <p>Keep roles aligned across service, prep, and maintenance.</p>
    </header>

    <ul class="skills__list">
      <li v-for="skill in skills" :key="skill.label" class="skills__item">
        <UIcon :name="skill.icon" />
        <span>{{ skill.label }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
export interface SkillItem {
  label: string
  icon: string
}

defineProps<{ skills: SkillItem[] }>()

defineOptions({ name: 'NiederhornLandingSkillsIcons' })
</script>

<style scoped>
.skills {
  border-radius: 1.25rem;
  border: 1px dashed var(--ui-border-subtle);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(248, 250, 252, 0.8);
}

.skills__header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.skills__list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.skills__item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border-radius: 999px;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--ui-border-subtle);
}

.skills__item span {
  font-weight: 500;
}
</style>
