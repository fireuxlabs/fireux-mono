/* eslint-disable */
declare module '#imports' {
  export const useNuxtApp: () => any
  export const useFirestoreManager: () => any
  export const useObject: (config: any) => Promise<any>
  export const useApp: () => Promise<any>
  export const useAppUser: () => Promise<any>
  export const useProfile: <T = any>(config: any) => Promise<any>
  export const useFireUXConfig: () => any
}
