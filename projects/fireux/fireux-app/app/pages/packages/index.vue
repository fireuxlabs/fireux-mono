<template><PackageLibrary app-name="FireUX" :packages="appPackages" :examples="[]" /></template>
<script setup lang="ts">
import PackageLibrary from 'fireux-core/runtime/app/components/Packages.vue'
import { appPackages } from '../../utils/package-library'
definePageMeta({ layout: 'docs' })
useSeoMeta({ title: 'Package library · FireUX', robots: 'noindex, nofollow' })
</script>
