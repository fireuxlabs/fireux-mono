<!-- Concurrent edit — 2026-07-21 13:05 CEST — Operation detail surfaces: add catalogue-backed factual pages. -->
<template>
  <PublicSimplePage
    v-if="operation"
    :title="`Manage your ${operation.title}`"
    :description="operation.description"
    :eyebrow="operation.console.name"
    :back-to="`/operations#${operation.console.id}`"
    back-label="Operations"
  >
    <template #actions>
      <UButton
        :to="operation.to"
        :icon="operation.icon"
        color="primary"
        trailing-icon="i-lucide-arrow-right"
      >
        Open {{ operation.title }}
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createError, useAsyncData, useSeoMeta } from '#imports'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import type { FireuxMetaOperation } from '../../../models/system/meta-content.model'
import { getFireuxOperationRouteKey } from '../../../utils/operation-route'

type OperationsResponse = {
  ok: boolean
  operations: FireuxMetaOperation[]
}

const fireux = useFireUXConfig()
const consoleId = useRouteParam('consoleId')
const operationKey = useRouteParam('operationKey')
const appName = computed(() => fireux.appName || fireux.appShortName || 'App')

const { data } = await useAsyncData('public-app-operations', () =>
  $fetch<OperationsResponse>('/api/public/app/operations')
)

const operation = computed(() =>
  (data.value?.operations || []).find((entry) =>
    entry.console.id === consoleId.value &&
    getFireuxOperationRouteKey(entry) === operationKey.value
  )
)

if (!operation.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Operation not found: ${consoleId.value}/${operationKey.value}`,
  })
}

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: () => `Manage your ${operation.value?.title || 'operation'} - ${appName.value}`,
  ogTitle: () => `Manage your ${operation.value?.title || 'operation'} - ${appName.value}`,
  twitterTitle: () => `Manage your ${operation.value?.title || 'operation'} - ${appName.value}`,
  description: () => operation.value?.description || '',
  ogDescription: () => operation.value?.description || '',
  twitterDescription: () => operation.value?.description || '',
})
</script>
