import type { Ref } from 'vue'
import type { Module } from 'fireux-core/runtime/models/system/module.model'
import { useModuleCollection } from './fetch/useModuleCollection'
import { useModuleFetch } from './fetch/useModuleFetch'
import { useModuleCreate } from './mutations/useModuleCreate'
import { useModuleDelete } from './mutations/useModuleDelete'
import { useModuleUpdate } from './mutations/useModuleUpdate'

export type { Module }

export {
  useModuleCollection,
  useModuleFetch,
  useModuleCreate,
  useModuleDelete,
  useModuleUpdate,
}

export function useModule(id: string | Ref<string>) {
  return {
    ...useModuleFetch(id),
    ...useModuleCollection(),
    ...useModuleCreate(),
    ...useModuleDelete(),
    ...useModuleUpdate(),
  }
}
