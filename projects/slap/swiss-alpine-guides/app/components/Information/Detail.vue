<template>
  <UContainer id="content" class="site-information"><UBreadcrumb :items="[{ label: 'Home', to: '/' }, { label: page.title }]" /><UPage><UPageHeader :title="page.title" :description="page.description" /><UPageBody>
    <section v-for="section in page.sections" :key="section.title"><h2>{{ section.title }}</h2><p v-if="section.text">{{ section.text }}</p><ul v-if="section.items"><li v-for="item in section.items" :key="item">{{ item }}</li></ul><ul v-if="section.links"><li v-for="link in section.links" :key="link.href"><a :href="link.href" target="_blank" rel="noopener noreferrer">{{ link.label }} ↗</a></li></ul><div v-if="section.rows" class="site-information__table"><table><thead><tr><th v-for="column in section.columns" :key="column">{{ column }}</th></tr></thead><tbody><tr v-for="(row, i) in section.rows" :key="i"><td v-for="(cell, j) in row" :key="j">{{ cell }}</td></tr></tbody></table></div></section>
    <div class="site-information__actions"><UButton :to="{ path: '/contact', query: { tour: page.path === '/vouchers' ? 'gift-vouchers' : page.path === '/rentals' ? 'rentals' : 'general' } }" color="neutral" label="Contact Swiss Alpine Guides" /><UButton to="/activities" color="neutral" variant="outline" label="All activities" /></div>
    <p class="site-information__sources">Original source pages: <a v-for="(source, i) in page.sources" :key="source" :href="source" target="_blank" rel="noopener noreferrer">{{ i + 1 }} ↗</a></p>
  </UPageBody></UPage></UContainer>
</template>
<script setup lang="ts">
import type { InformationPage } from '~/content/site-information'
defineProps<{ page: InformationPage }>()
</script>
<style scoped>
.site-information { padding-block: 2rem 4rem; }
.site-information section { max-width: 58rem; }
.site-information h2 { font: 400 clamp(28px, 4vw, 40px)/1.2 Georgia, serif; letter-spacing: -.025em; margin-bottom: 1rem; }
.site-information p, .site-information li { line-height: 1.85; font-size: 15px; }
.site-information a { text-underline-offset: .2em; }
.site-information section a { text-decoration: underline; }
.site-information ul { padding-left: 1.2rem; display: grid; gap: .7rem; }
.site-information__table { overflow-x: auto; margin-top: 1.5rem; }
.site-information table { width: 100%; border-collapse: collapse; font-size: 14px; }
.site-information th, .site-information td { padding: 1rem .5rem; border-bottom: 1px solid #d4dcd6; text-align: left; }
.site-information__actions { display: flex; flex-wrap: wrap; gap: 12px; }
.site-information__sources { display: flex; flex-wrap: wrap; gap: 12px; color: #53676c; font-size: 12px !important; }
.site-information__sources a { text-decoration: underline; }
</style>
