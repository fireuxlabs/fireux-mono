import { computed, unref, type MaybeRef } from 'vue'
import { useFireUXConfig } from '../../app/FireUXConfig'
import type { FireuxAppScopeState } from '../../../../models/core/meta.model'

const text = (value: unknown) => String(value ?? '').trim()
const key = (value: unknown) => text(value).toLowerCase()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

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

export type PublicAppScopedTarget = {
  app_scope?: unknown
  app_scope_state?: unknown
  app_scope_app_id?: unknown
}

export type PublicAppScopedSource = {
  state: FireuxAppScopeState | ''
  sourceAppId: string
  hasTenantApp: boolean
}

export function resolvePublicAppScopedSource(
  target?: PublicAppScopedTarget | null,
  fallbackAppId?: unknown
): PublicAppScopedSource {
  const appScope = record(target?.app_scope)
  const state = (
    text(appScope.state) ||
    text(target?.app_scope_state)
  ) as FireuxAppScopeState | ''
  const sourceAppId =
    text(appScope.app_id) ||
    text(target?.app_scope_app_id) ||
    text(fallbackAppId)

  return {
    state,
    sourceAppId,
    hasTenantApp: state === 'dedicated_app',
  }
}

export function usePublicAppScopedSource(
  target: MaybeRef<PublicAppScopedTarget | null | undefined>
) {
  const { appId } = useFireUXConfig()
  const source = computed(() =>
    resolvePublicAppScopedSource(unref(target), appId)
  )

  return {
    source,
    state: computed(() => source.value.state),
    sourceAppId: computed(() => source.value.sourceAppId),
    hasTenantApp: computed(() => source.value.hasTenantApp),
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
