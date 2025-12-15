export type FireuxEcosystemConfig = {
  id: string
  name: string
  description: string
}

export const ecosystemConfigTemplate = {
  id: '',
  name: '',
  description: '',
} as const satisfies FireuxEcosystemConfig
