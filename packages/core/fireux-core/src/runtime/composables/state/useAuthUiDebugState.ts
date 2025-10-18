import { useState } from 'nuxt/app'

export type AuthUiDebugMode = 'sign-in' | 'sign-up'

export type AuthUiDebugSnapshot = {
  isTenant: boolean
  mode: AuthUiDebugMode
  formTitle: string
  description: string
  brandLabel: string
  submitLabel: string
  separatorLabel: string
  isSignUpToggle: boolean
  formLoading: boolean
  providerLoading: boolean
  lastEvent: string
  errorTitle?: string
  errorDescription?: string
  errorHint?: string
}

export function useAuthUiDebugState() {
  const authUiDebug = useState<AuthUiDebugSnapshot>('auth-ui-debug', () => ({
    isTenant: false,
    mode: 'sign-in',
    formTitle: '',
    description: '',
    brandLabel: '',
    submitLabel: '',
    separatorLabel: '',
    isSignUpToggle: false,
    formLoading: false,
    providerLoading: false,
    lastEvent: 'idle',
    errorTitle: undefined,
    errorDescription: undefined,
    errorHint: undefined,
  }))

  return { authUiDebug }
}
