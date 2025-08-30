/* eslint-disable */
// Ambient declarations for composables provided by fireux-core at runtime
// This keeps TypeScript happy in this package without deep imports.
declare function useFirestoreManager(): {
  setDocument: (collection: string, id: string, data: any) => Promise<void>
  updateDocument: (collection: string, id: string, data: any) => Promise<void>
  deleteDocument: (collection: string, id: string) => Promise<void>
}

declare function useObject(config: any): Promise<any>
declare function useProfile<T = any>(config: any): Promise<any>
declare function useApp(): Promise<any>
declare function useAppUser(): Promise<any>
declare function useFireUXConfig(): any
declare function useNuxtApp(): any

export {}
