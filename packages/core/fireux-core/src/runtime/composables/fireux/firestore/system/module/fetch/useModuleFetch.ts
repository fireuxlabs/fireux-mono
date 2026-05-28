import { computed, type Ref } from 'vue'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import {
  ModuleStorage,
  type Module,
} from 'fireux-core/runtime/models/system/module.model'

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useModuleFetch(moduleId: string | Ref<string | null | undefined>) {
  const { firestoreFetchDoc } = useFirestoreRead()
  const resolvedModuleId = computed(() =>
    normalizeString(typeof moduleId === 'string' ? moduleId : moduleId.value)
  )
  const source = computed(() =>
    resolvedModuleId.value
      ? firestoreFetchDoc<Module>(ModuleStorage.collection, resolvedModuleId.value)
      : null
  )
  const module = computed(() => source.value?.value ?? null)

  return {
    module,
    exists: computed(() => Boolean(module.value)),
  }
}
