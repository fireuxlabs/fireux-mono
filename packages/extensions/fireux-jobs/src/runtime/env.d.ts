/* eslint-disable */
// Ambient declarations for composables provided by fireux-core and Nuxt at runtime
// Declare globals so package-level tsc can resolve them without deep imports.
declare global {
  function useFirestoreManager(): {
    setDocument: (collection: string, id: string, data: any) => Promise<void>
    updateDocument: (collection: string, id: string, data: any) => Promise<void>
    deleteDocument: (collection: string, id: string) => Promise<void>
  }

  function useObject(config: any): Promise<any>
  function useProfile<T = any>(config: any): Promise<any>
  function useApp(): Promise<any>
  function useAppUser(): Promise<any>
  function useFireUXConfig(): any
  function useNuxtApp(): any

  // vuefire convenience composables when auto-imported
  function useFirestore(): any
  function useFirestoreUtils(): { waitForCurrentUser: () => Promise<any> }
}

export {}
