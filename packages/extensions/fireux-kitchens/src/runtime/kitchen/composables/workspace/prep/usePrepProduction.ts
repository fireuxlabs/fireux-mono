import { computed, onMounted, ref, watch } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useKitchenWorkspace } from '../useKitchenWorkspace'

type Task = {
  id: string
  name: string
  date: string
  planned: number
  unit: string
  batch?: { quantity: number; recordedAt: string }
}

export function usePrepProduction() {
  const kitchen = useKitchenWorkspace()
  const { uid } = useAppSession()
  const { appId } = useFireUXConfig()
  const key = computed(() =>
    uid.value && kitchen.id.value && kitchen.outcome.value === 'ready'
      ? JSON.stringify([
          'prep-production-v1',
          appId,
          uid.value,
          kitchen.id.value,
        ])
      : ''
  )
  const tasks = ref<Task[]>([])
  const error = ref('')
  const mounted = ref(false)
  const ready = computed(
    () => mounted.value && Boolean(key.value) && !error.value
  )

  function read(storageKey: string): Task[] {
    return JSON.parse(localStorage.getItem(storageKey) ?? '[]')
  }

  onMounted(() => {
    mounted.value = true
  })
  watch(
    [mounted, key],
    ([active, storageKey]) => {
      tasks.value = []
      error.value = ''
      if (!active || !storageKey) return
      try {
        tasks.value = read(storageKey)
      } catch {
        error.value = 'Could not open the prep records saved in this browser.'
      }
    },
    { flush: 'sync' }
  )

  function save(update: (rows: Task[]) => Task[]) {
    if (!mounted.value || !key.value) return false
    try {
      const next = update(read(key.value))
      localStorage.setItem(key.value, JSON.stringify(next))
      tasks.value = next
      error.value = ''
      return true
    } catch {
      error.value = 'Could not save the prep records in this browser.'
      return false
    }
  }

  const positive = (value: number) => Number.isFinite(value) && value > 0

  function add(name: string, date: string, planned: number, unit: string) {
    if (!name.trim() || !unit.trim() || !date || !positive(planned))
      return false
    return save((rows) => [
      ...rows,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        date,
        planned,
        unit: unit.trim(),
      },
    ])
  }

  function complete(id: string, quantity: number) {
    if (!positive(quantity)) return false
    return save((rows) =>
      rows.map((task) =>
        task.id === id && !task.batch
          ? {
              ...task,
              batch: { quantity, recordedAt: new Date().toISOString() },
            }
          : task
      )
    )
  }

  return { tasks, ready, error, add, complete }
}
