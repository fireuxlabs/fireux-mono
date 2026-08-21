import { computed, unref, type MaybeRef } from 'vue'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import {
  readFireuxEntityManagement,
  resolveFireuxEntityManagementAppId,
} from '../../../../utils/entity-management'
import type { FireuxEntityManagement } from '../../../../models/utils/scope.model'

const text = (value: unknown) => String(value ?? '').trim()
const key = (value: unknown) => text(value).toLowerCase()
export type PublicScopeOptions<TScope> = {
  scopeKey: MaybeRef<unknown>
  scopes: MaybeRef<TScope[] | null | undefined>
  scopeKeyOf: (scope: TScope) => unknown
  scopeIdOf: (scope: TScope) => unknown
  pending?: MaybeRef<boolean>
}

export type PublicScopedRecordsOptions<TEntity> = {
  recordKey?: MaybeRef<unknown>
  records: MaybeRef<TEntity[] | null | undefined>
  recordKeyOf: (record: TEntity) => unknown
  isPublicRecord: (record: TEntity) => boolean
  pending?: MaybeRef<boolean>
}

export type FireuxManagedEntity = { management?: unknown }

export type FireuxEntityManagementTarget = {
  mode: FireuxEntityManagement['mode'] | ''
  appId: string
  hasDedicatedApp: boolean
}

export function resolveFireuxEntityManagementTarget(
  target?: FireuxManagedEntity | null,
  fallbackAppId?: unknown,
  ecosystem?: unknown
): FireuxEntityManagementTarget {
  const management = readFireuxEntityManagement(target?.management)
  const mode = management?.mode || ''
  const appId = management
    ? resolveFireuxEntityManagementAppId(management, text(ecosystem))
    : text(fallbackAppId)

  return {
    mode,
    appId,
    hasDedicatedApp: mode === 'app',
  }
}

export function useFireuxEntityManagementTarget(
  target: MaybeRef<FireuxManagedEntity | null | undefined>
) {
  const { appId, ecosystem } = useFireUXConfig()
  const source = computed(() =>
    resolveFireuxEntityManagementTarget(unref(target), appId, ecosystem)
  )

  return {
    source,
    mode: computed(() => source.value.mode),
    appId: computed(() => source.value.appId),
    hasDedicatedApp: computed(() => source.value.hasDedicatedApp),
  }
}

export function usePublicScope<TScope>(options: PublicScopeOptions<TScope>) {
  const scope = computed<TScope | null>(
    () =>
      (unref(options.scopes) ?? []).find(
        (item) => key(options.scopeKeyOf(item)) === key(unref(options.scopeKey))
      ) ?? null
  )
  const scopeId = computed(() => text(scope.value ? options.scopeIdOf(scope.value) : ''))
  const pending = computed(() => Boolean(unref(options.pending)))

  return {
    scope,
    scopeId,
    pending,
  }
}

export function usePublicScopedRecords<TEntity>(
  options: PublicScopedRecordsOptions<TEntity>
) {
  const records = computed(() =>
    (unref(options.records) ?? []).filter((record) => options.isPublicRecord(record))
  )
  const record = computed<TEntity | null>(() => {
    const selectedKey = text(unref(options.recordKey))
    if (!selectedKey) return null

    return (
      records.value.find(
        (item) => text(options.recordKeyOf(item)) === selectedKey
      ) ?? null
    )
  })
  const pending = computed(() => Boolean(unref(options.pending)))

  return {
    records,
    record,
    pending,
  }
}
