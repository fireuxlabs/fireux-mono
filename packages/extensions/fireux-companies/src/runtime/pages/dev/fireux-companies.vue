<template>
  <UPage>
    <UPageHeader
      title="Dev · Companies"
      description="Inspect the immutable Company role contract and its Place-backed projections."
    />

    <UPageBody class="pagebody">
      <CompanyCollectionManager
        title="Companies"
        description="Canonical Company records with their same-ID Places."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-companies',
    label: 'Companies (Ext)',
    icon: 'i-lucide-building-2',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

</script>
