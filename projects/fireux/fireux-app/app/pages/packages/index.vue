<template><PackageLibrary app-name="FireUX" :packages="appPackages" :examples="[]" /></template>
<script setup lang="ts">
import PackageLibrary from 'fireux-core/runtime/app/components/Packages.vue'
import { appPackages } from '../../utils/package-library'
definePageMeta({ layout: 'default', nav: { key: 'package-library', label: 'Packages', icon: 'i-lucide-package', position: 'bottom', layouts: ['default', 'landing'], desktop: true, mobile: true } })
useSeoMeta({ title: 'Package library · FireUX', robots: 'noindex, nofollow' })
</script>
