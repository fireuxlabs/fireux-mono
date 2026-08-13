<template>
  <section
    class="grid gap-4 border-b border-default bg-default px-4 py-4 lg:px-12"
    aria-labelledby="template-one-assets-title"
  >
    <header class="flex items-center justify-between gap-4">
      <div>
        <small>{{ assetFamilyLabel }}</small>
        <h2 id="template-one-assets-title">{{ name }}</h2>
      </div>
      <UBadge :color="ready ? 'success' : 'warning'" variant="soft">
        {{ ready ? 'Ready' : `${presentCount}/${requirements.length}` }}
      </UBadge>
    </header>

    <ul class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3 p-0">
      <li
        v-for="asset in assets"
        :key="asset.role"
        class="grid min-w-0 gap-3 rounded-lg border border-default p-3"
      >
        <img
          v-if="asset.status === 'present' && asset.previewSrc"
          :src="asset.previewSrc"
          :alt="`${name} ${asset.label}`"
          class="h-36 w-full rounded-md border border-default bg-muted object-contain p-3"
        >
        <div class="flex min-w-0 items-center justify-between gap-4">
          <div class="grid min-w-0 gap-0.5">
            <strong>{{ asset.label }}</strong>
            <code class="truncate text-xs text-muted">{{ asset.filename }}</code>
            <small class="text-muted">{{ asset.requirement }}</small>
          </div>
          <UBadge
            :color="asset.status === 'present' ? 'success' : asset.status === 'checking' ? 'neutral' : 'warning'"
            variant="soft"
          >
            {{ statusLabel(asset.status) }}
          </UBadge>
        </div>
      </li>
    </ul>
    <p v-if="stage === 'app'" class="m-0 text-xs text-muted">
      {{ authority === 'demo' ? 'Demo data → Firebase Storage · five template input roles' : 'Firebase Storage · five canonical App masters' }}
    </p>
    <p v-if="storageError" class="m-0 text-xs text-error">
      Storage check unavailable: {{ storageError }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  entityAssetDimensionsMatch,
  entityAssetRequirementsForStage,
  EntityAssetStageRoles,
  type EntityAssetRole,
  type EntityAssetSourceMap,
  type EntityAssetStage,
} from 'fireux-core/runtime/models/operations/entity-asset-onboarding'
import type { AppAssetReadiness } from 'fireux-core/runtime/server/utils/appAssetReadiness'

const props = defineProps<{
  name: string
  stage: EntityAssetStage
  sources: EntityAssetSourceMap
  storageReadiness?: AppAssetReadiness | null
  storagePending?: boolean
  storageError?: string
  authority?: 'app' | 'demo'
}>()

type AssetStatus = 'checking' | 'present' | 'invalid' | 'missing'
const statuses = ref<Partial<Record<EntityAssetRole, AssetStatus>>>({})
let generation = 0

const requirements = computed(() => entityAssetRequirementsForStage(props.stage))
const stageLabel = computed(() =>
  props.stage === 'root' ? 'Root' : props.stage === 'console' ? 'Console' : 'App'
)
const assetFamilyLabel = computed(() =>
  props.stage === 'app' && props.authority === 'demo' ? 'Demo template assets' : `${stageLabel.value} assets`
)
const assets = computed(() => requirements.value.map(asset => ({
  ...asset,
  status: statuses.value[asset.role] || 'checking',
  previewSrc: props.stage === 'app' && props.authority !== 'demo'
    ? `/api/templates/template-one/assets/${asset.role}?appId=${encodeURIComponent(props.storageReadiness?.appId || '')}`
    : props.sources[asset.role] || '',
})))
const presentCount = computed(() =>
  assets.value.filter(asset => asset.status === 'present').length
)
const ready = computed(() => presentCount.value === requirements.value.length)
const appStorageRoles = new Set<EntityAssetRole>(EntityAssetStageRoles.console)
const statusLabel = (status: AssetStatus) => ({
  checking: 'Checking',
  present: 'Available',
  invalid: 'Needs attention',
  missing: 'Missing',
})[status]

watch(
  () => [props.stage, props.sources, props.storageReadiness] as const,
  async () => {
    const current = ++generation
    if (props.stage === 'app' && props.authority !== 'demo') {
      const storageByKind = new Map(
        (props.storageReadiness?.assets || []).map(asset => [asset.kind, asset.valid])
      )
      statuses.value = Object.fromEntries(requirements.value.map(asset => {
        if (appStorageRoles.has(asset.role)) {
          return [
            asset.role,
            props.storagePending
              ? 'checking'
              : storageByKind.get(asset.role) ? 'present' : 'missing',
          ]
        }
        return [asset.role, props.sources[asset.role] ? 'checking' : 'missing']
      }))
    } else {
      statuses.value = Object.fromEntries(
        requirements.value.map(asset => [asset.role, props.sources[asset.role] ? 'checking' : 'missing'])
      )
    }
    if (import.meta.server) return
    await Promise.all(requirements.value.map(asset => new Promise<void>((resolve) => {
      if (
        props.stage === 'app' &&
        props.authority !== 'demo' &&
        appStorageRoles.has(asset.role)
      ) return resolve()
      const source = props.sources[asset.role]
      if (!source) return resolve()
      const image = new Image()
      const finish = (status: AssetStatus) => {
        if (current === generation) statuses.value = { ...statuses.value, [asset.role]: status }
        resolve()
      }
      image.onload = () => finish(
        entityAssetDimensionsMatch(asset, image.naturalWidth, image.naturalHeight)
          ? 'present'
          : 'invalid'
      )
      image.onerror = () => finish('missing')
      image.src = source
    })))
  },
  { immediate: true, deep: true }
)

onBeforeUnmount(() => { generation += 1 })
</script>
