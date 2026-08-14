import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type {
  DevDebugContract,
  DevDebugContractFinding,
  DevDebugContracts,
} from '../../types/dev-debug'
import { isPlainObject, resolveDriftFromModel } from './useModelDrift'

const isEmptyRequiredValue = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0)

const readPath = (value: Record<string, unknown>, path: string) =>
  path
    .split('.')
    .reduce<unknown>(
      (current, key) => (isPlainObject(current) ? current[key] : undefined),
      value
    )

const inspectValue = (
  target: string,
  value: unknown,
  contract: DevDebugContract
): DevDebugContractFinding[] => {
  const values = Array.isArray(value) ? value : [value]

  return values.map((candidate, index) => {
    const data = isPlainObject(candidate) ? candidate : undefined
    const drift = resolveDriftFromModel(contract.model, data, '', {
      includeMissing: false,
      requiredPaths: new Set(contract.requiredPaths || []),
      ignoreExtraTimestampFields: contract.ignoreExtraTimestampFields,
    })
    const emptyRequired = (contract.requiredPaths || [])
      .filter((path) => data && isEmptyRequiredValue(readPath(data, path)))
      .map((path) => `${path} (empty)`)

    return {
      target: Array.isArray(value) ? `${target}[${index}]` : target,
      missing: [...new Set([...drift.missing, ...emptyRequired])],
      extra: drift.extra,
    }
  })
}

export const useDevDebugContracts = (
  objects: MaybeRefOrGetter<unknown>,
  contract: MaybeRefOrGetter<DevDebugContract | undefined>,
  contracts: MaybeRefOrGetter<DevDebugContracts | undefined>
) => {
  const findings = computed(() => {
    const value = toValue(objects)
    const rootContract = toValue(contract)
    const mappedContracts = toValue(contracts)
    const result: DevDebugContractFinding[] = []

    if (rootContract)
      result.push(...inspectValue('objects', value, rootContract))
    if (mappedContracts && isPlainObject(value)) {
      for (const [key, mappedContract] of Object.entries(mappedContracts)) {
        result.push(...inspectValue(key, value[key], mappedContract))
      }
    }

    return result.filter(
      (finding) => finding.missing.length || finding.extra.length
    )
  })

  const missingCount = computed(() =>
    findings.value.reduce((total, finding) => total + finding.missing.length, 0)
  )
  const extraCount = computed(() =>
    findings.value.reduce((total, finding) => total + finding.extra.length, 0)
  )

  return { findings, missingCount, extraCount }
}
