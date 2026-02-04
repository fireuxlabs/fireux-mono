<template>
  <UPage>
    <UPageHeader
      title="Dev · Jobs (Ext)"
      description="Professionals Agents and jobs Development tools"
    />

    <DevJobSystem />
    <DevProfessionalSystem />
    <DevAgentSystem />
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-jobs',
    label: 'Jobs (Ext)',
    icon: 'i-lucide-briefcase',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})
</script>
