<template>
  <div class="page">
    <h1 class="text-3xl font-bold mb-8">Skills</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <section
        v-for="skill in skills"
        :id="anchorId(skill.name)"
        :key="skill.name"
        class="p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
      >
        <Icon :name="skill.icon" class="w-12 h-12 mb-4" />
        <h2 class="text-xl font-semibold mb-2">{{ skill.name }}</h2>
        <p class="text-gray-600">{{ skill.description }}</p>
      </section>
    </div>
  </div>
</template>

<script setup>
const skills = [
  {
    name: 'Nuxt.js',
    icon: 'skill-icons:nuxtjs-dark',
    description:
      'Nuxt.js is the main framework for this project, providing SSR, routing, and modular architecture.',
  },
  {
    name: 'Tailwind CSS',
    icon: 'skill-icons:tailwindcss-dark',
    description:
      'Tailwind CSS is used for utility-first styling and rapid UI development.',
  },
  {
    name: 'SCSS',
    icon: 'skill-icons:sass',
    description:
      'SCSS is used for advanced styling, variables, and design system organization.',
  },
  {
    name: 'Firebase',
    icon: 'vscode-icons:file-type-firebase',
    description:
      'Firebase powers authentication, database, and serverless functions.',
  },
  {
    name: 'PWA',
    icon: 'logos:pwa',
    description:
      'Progressive Web App features enable offline support and installability.',
  },
  {
    name: 'JavaScript',
    icon: 'skill-icons:javascript',
    description:
      'JavaScript is used throughout the project for scripting and logic.',
  },
  {
    name: 'TypeScript',
    icon: 'skill-icons:typescript',
    description:
      'TypeScript provides type safety and improved developer experience.',
  },
  {
    name: 'GitHub',
    icon: 'skill-icons:github-dark',
    description: 'GitHub is used for version control and collaboration.',
  },
  {
    name: 'CSS3',
    icon: 'skill-icons:css',
    description: 'CSS3 is used for styling and layout.',
  },
  {
    name: 'HTML5',
    icon: 'skill-icons:html',
    description: 'HTML5 is the foundation for all web pages in the project.',
  },
  {
    name: 'Node.js',
    icon: 'vscode-icons:file-type-node',
    description:
      'Node.js is used for server-side logic and Firebase Functions.',
  },
]

const anchorId = (name) => name.toLowerCase().replace(/\W+/g, '-')
</script>

<style scoped>
/* Let components handle their own spacing with Tailwind/NuxtUI utilities */
</style>
