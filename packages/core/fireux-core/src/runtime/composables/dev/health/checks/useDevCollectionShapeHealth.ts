import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { DevHealthIssue, DevHealthIssueSeverity, DevHealthResult, DevHealthScope, DevHealthStatus } from '../types'

export type DevCollectionShapeRow = {
  id: string
  missing: string[]
  legacy: string[]
}

export type DevCollectionShapeReport = {
  total: number
  flagged: number
  flaggedIds: string[]
  details: DevCollectionShapeRow[]
}

type Options<TItem> = {
  id: string
  label: string
  description: string
  scope: DevHealthScope

  items: Ref<TItem[] | null | undefined> | ComputedRef<TItem[]>

  requiredKeys: readonly string[]
  allowedKeys: readonly string[]

  getId?: (item: TItem) => string
  maxIssues?: number
}

export function useDevCollectionShapeHealth<TItem>(options: Options<TItem>) {
  const allowedKeySet = computed(() => new Set(options.allowedKeys))

  function inspectShape(value: any) {
    const keys = value && typeof value === 'object' ? Object.keys(value) : []
    const missing = options.requiredKeys.filter((k) => value?.[k] == null)
    const legacy = keys.filter((k) => !allowedKeySet.value.has(k))
    return { missing, legacy }
  }

  const report = computed<DevCollectionShapeReport>(() => {
    const items = (options.items as any)?.value ?? []

    const rows: DevCollectionShapeRow[] = items.map((item: any) => {
      const { missing, legacy } = inspectShape(item)
      const fallbackId = item?.id ?? '(missing id)'
      const id = options.getId ? options.getId(item) : fallbackId
      return { id, missing, legacy }
    })

    const flagged = rows.filter((r) => r.missing.length || r.legacy.length)

    return {
      total: rows.length,
      flagged: flagged.length,
      flaggedIds: flagged.map((r) => r.id),
      details: flagged,
    }
  })

  const dev = computed(() => {
    const h = report.value
    return `dev · health check · ${options.scope} · flagged ${h.flagged}/${h.total}`
  })

  const result = computed<DevHealthResult>(() => {
    const h = report.value

    const max = options.maxIssues ?? 30

    const issues: DevHealthIssue[] = h.details.slice(0, max).flatMap((row) => {
      const out: DevHealthIssue[] = []

      if (row.missing.length) {
        out.push({
          id: `${row.id}:missing`,
          message: `${row.id} missing: ${row.missing.join(', ')}`,
          severity: 'error' satisfies DevHealthIssueSeverity,
          hint: 'Missing required fields usually indicates legacy docs or incomplete migration.',
        })
      }

      if (row.legacy.length) {
        out.push({
          id: `${row.id}:legacy`,
          message: `${row.id} legacy keys: ${row.legacy.join(', ')}`,
          severity: 'warning' satisfies DevHealthIssueSeverity,
          hint: 'Legacy keys typically require a migrate script (rename/move/drop fields).',
        })
      }

      return out
    })

    if (h.flagged > max) {
      issues.push({
        id: 'truncated',
        message: `Showing first ${max} flagged docs (see JSON for full details).`,
        severity: 'info',
      })
    }

    let status: DevHealthStatus = 'pass'
    if (h.details.some((d) => d.missing.length)) status = 'fail'
    else if (h.details.some((d) => d.legacy.length)) status = 'warn'

    return {
      id: options.id,
      label: options.label,
      description: options.description,
      status,
      summary: `flagged ${h.flagged}/${h.total}`,
      issues,
      scopes: [options.scope],
      stats: {
        total: h.total,
        flagged: h.flagged,
      },
    }
  })

  return { dev, report, result }
}
