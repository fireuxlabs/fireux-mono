<template>
  <UPage>
    <UPageHeader
      title="Dev · Jobs (Ext)"
      description="Model and collection tools for jobs, professionals, and agents."
    />

    <UPageBody class="pagebody">
      <DevJobSystem />
      <DevProfessionalSystem />
      <DevAgentSystem />
    </UPageBody>
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
