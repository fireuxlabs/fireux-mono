export type EnvVarEntry = {
  key: string
  present: boolean
  value?: string
}

export type AdminAuthStatus = {
  json: boolean
  splitKeys: {
    FIREBASE_PROJECT_ID: boolean
    FIREBASE_CLIENT_EMAIL: boolean
    FIREBASE_PRIVATE_KEY: boolean
  }
  file?: boolean
  /** Explicit credential env detected; standard ADC is not probed here. */
  configured: boolean
}

export type BrandAssetCheck = {
  name: string
  path: string
  ok: boolean
  source?: string
  reason?: string
  width?: number
  height?: number
}

export interface EnvCheckResponse {
  isValid: boolean
  required: EnvVarEntry[]
  optionalClient: EnvVarEntry[]
  optional?: EnvVarEntry[]
  server: { adminAuth: AdminAuthStatus }
  missingRequired: string[]
  summary: {
    required: string
    optionalClient: string
    brandAssets?: string
  }
  warnings: string[]
  notes: string[]
  brandAssets: BrandAssetCheck[]
}
