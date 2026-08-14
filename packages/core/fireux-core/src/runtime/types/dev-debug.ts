export type DevDebugObjectOrigin = 'fetched' | 'passed'

export type DevDebugContract = {
  model: Record<string, unknown>
  requiredPaths?: string[]
  ignoreExtraTimestampFields?: boolean
}

export type DevDebugContracts = Record<string, DevDebugContract>

export type DevDebugContractFinding = {
  target: string
  missing: string[]
  extra: string[]
}

export type DevDebugPayload<
  TObjects extends Record<string, unknown> = Record<string, unknown>,
  TDerived extends Record<string, unknown> = Record<string, unknown>,
> = {
  objectOrigin: DevDebugObjectOrigin
  objects: TObjects
  derived: TDerived
}

export const defineDevDebugPayload = <
  TObjects extends Record<string, unknown>,
  TDerived extends Record<string, unknown>,
>(
  payload: DevDebugPayload<TObjects, TDerived>
) => payload
