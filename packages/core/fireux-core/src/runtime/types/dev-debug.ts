export type DevDebugObjectOrigin = 'fetched' | 'passed'

export type DevDebugContract = {
  name?: string
  model: Record<string, unknown>
  requiredPaths?: string[]
  deprecatedPaths?: string[]
  ignoreExtraTimestampFields?: boolean
}

export type DevDebugContracts = Record<string, DevDebugContract>

export type DevDebugContractFinding = {
  target: string
  missing: string[]
  extra: string[]
  deprecated: string[]
}

export type DevDebugDependencies = Record<string, string | string[]>

export type DevDebugState = {
  __debugState: 'loading' | 'not-fetched' | 'redacted'
}

export const devDebugState = (
  state: DevDebugState['__debugState']
): DevDebugState => ({
  __debugState: state,
})

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
