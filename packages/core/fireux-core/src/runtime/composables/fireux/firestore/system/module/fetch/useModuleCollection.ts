import { computed } from 'vue'
import { useFirestoreRead } from '../../../operations/useFirestoreRead'
import {
  ModuleStorage,
  type Module,
} from 'fireux-core/runtime/models/system/module.model'

export function useModuleCollection() {
  const { firestoreFetchCollection } = useFirestoreRead()
  const modules = firestoreFetchCollection<Module>(ModuleStorage.collection)
  const count = computed(() => modules.value?.length ?? 0)

  return {
    modules,
    count,
  }
}
