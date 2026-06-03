import { computed, unref, type MaybeRef } from 'vue'

const text = (value: unknown) => String(value ?? '').trim()
const key = (value: unknown) => text(value).toLowerCase()

export type PublicScopeOptions<TScope> = {
  scopeKey: MaybeRef<unknown>
  scopes: MaybeRef<TScope[]>
  scopeKeyOf: (scope: TScope) => unknown
  scopeIdOf: (scope: TScope) => unknown
  pending?: MaybeRef<boolean>
}

export type PublicScopedRecordsOptions<TEntity> = {
  recordKey?: MaybeRef<unknown>
  records: MaybeRef<TEntity[]>
  recordKeyOf: (record: TEntity) => unknown
  isPublicRecord: (record: TEntity) => boolean
  pending?: MaybeRef<boolean>
}

export function usePublicScope<TScope>(options: PublicScopeOptions<TScope>) {
  const scope = computed<TScope | null>(
    () =>
      unref(options.scopes).find(
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
    unref(options.records).filter((record) => options.isPublicRecord(record))
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
