<template><div id="content"><UContainer><UBreadcrumb :items="[{ label: 'Home', to: '/' }, { label: 'Contact' }]" /><UPageHeader title="Contact & enquiries" description="Talk to Swiss Alpine Guides about activities, private guides, equipment rentals or gift vouchers." /></UContainer><LandingEnquiry /></div></template>
<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { buildSiteJsonLd } from '~/utils/site-seo'
definePageMeta({ layout: 'alpine', colorMode: 'light' })
useSeo({ title: 'Contact Swiss Alpine Guides | Activities & Private Guides, Interlaken', description: 'Contact Swiss Alpine Guides at Eyacheri 2, Matten bei Interlaken, by phone, WhatsApp or email. Enquire about activities, rentals and gift vouchers.', path: '/contact', jsonLdBuilder: context => buildSiteJsonLd(context) })
</script>
