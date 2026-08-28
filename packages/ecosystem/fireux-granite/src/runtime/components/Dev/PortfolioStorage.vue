<template>
  <DevPortfolioSystem :additional-child-collections="graniteChildCollections" />
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 22:24 CEST — Repo Efficiency Pass 5 of 6: own Granite's cross-extension portfolio inspection.
import { ComplianceRecordStorage } from 'fireux-compliance/runtime/portfolio/models/compliance-record.model'
import { DocumentLinkStorage } from 'fireux-documents/runtime/portfolio/models/document-link.model'
import { DocumentStorage } from 'fireux-documents/runtime/portfolio/models/document.model'
import DevPortfolioSystem from 'fireux-properties/runtime/portfolio/components/dev/System.vue'
import { TaskStorage } from 'fireux-tasks/runtime/portfolio/models/task.model'

defineOptions({ name: 'GraniteDevPortfolioStorage' })

const graniteChildCollections = [
  DocumentStorage.collection,
  DocumentLinkStorage.collection,
  TaskStorage.collection,
  ComplianceRecordStorage.collection,
]
</script>
