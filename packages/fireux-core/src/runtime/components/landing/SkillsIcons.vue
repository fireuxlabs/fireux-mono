<!-- COMMENT: app/components/landing/SkillsIcons.vue -->
<template>
  <div class="skills-icons">
    <Icon
      v-for="skill in skills"
      :key="skill.name"
      :name="skill.icon"
      class="icon"
    />
  </div>
</template>

<script setup>
// Define your skills here:
const skills = [
  { name: 'Nuxt.js', icon: 'skill-icons:nuxtjs-dark' },
  { name: 'Tailwind CSS', icon: 'skill-icons:tailwindcss-dark' },
  { name: 'SCSS', icon: 'skill-icons:sass' },
  { name: 'Firebase', icon: 'vscode-icons:file-type-firebase' },
  { name: 'PWA', icon: 'logos:pwa' },
  { name: 'JavaScript', icon: 'skill-icons:javascript' },
  { name: 'TypeScript', icon: 'skill-icons:typescript' },
  { name: 'GitHub', icon: 'skill-icons:github-dark' },
  { name: 'CSS3', icon: 'skill-icons:css' },
  { name: 'HTML5', icon: 'skill-icons:html' },
  { name: 'Node.js', icon: 'vscode-icons:file-type-node' }
]
</script>

<style scoped>
.skills-icons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 0;
}

.icon {
  width: 48px;
  height: 48px;
}
</style>
