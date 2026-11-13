<template><InformationDetail :page="page" /></template>
<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { informationPages } from '~/content/site-information'
import { buildSiteJsonLd } from '~/utils/site-seo'
definePageMeta({ layout: 'alpine', colorMode: 'light' })
const page = informationPages.vouchers!
useSeo({ title: `${page.title} | Swiss Alpine Guides`, description: page.description, path: page.path, jsonLdBuilder: context => buildSiteJsonLd(context) })
</script>
