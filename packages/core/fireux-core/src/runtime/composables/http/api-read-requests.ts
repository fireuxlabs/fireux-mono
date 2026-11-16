type RequestEntry = {
  controller: AbortController
  promise: Promise<unknown>
  consumers: Set<object>
  settled: boolean
  timer?: ReturnType<typeof setTimeout>
}

/** Share overlapping same-scope GETs without changing Nuxt's cancellation defaults. */
export function createApiReadRequests() {
  const entries = new Map<string, RequestEntry>()
  return {
    run<T>(
      key: string,
      signal: AbortSignal,
      execute: (signal: AbortSignal) => Promise<T>
    ): Promise<T> {
      if (signal.aborted)
        return Promise.reject(new DOMException('Aborted', 'AbortError'))
      let entry = entries.get(key)
      if (!entry) {
        const controller = new AbortController()
        entry = {
          controller,
          consumers: new Set(),
          settled: false,
          promise: Promise.resolve().then(() => execute(controller.signal)),
        }
        const current = entry
        entries.set(key, current)
        const finish = () => {
          current.settled = true
          clearTimeout(current.timer)
          if (entries.get(key) === current) entries.delete(key)
        }
        void current.promise.then(finish, finish)
      }
      const current = entry,
        consumer = {}
      clearTimeout(current.timer)
      current.consumers.add(consumer)
      return new Promise<T>((resolve, reject) => {
        let active = true
        const release = () => {
          if (!active) return false
          active = false
          signal.removeEventListener('abort', abort)
          current.consumers.delete(consumer)
          if (!current.settled && !current.consumers.size)
            // A native cancel/restart in the same turn can transfer ownership.
            current.timer = setTimeout(() => {
              if (!current.consumers.size) {
                current.controller.abort()
                if (entries.get(key) === current) entries.delete(key)
              }
            }, 0)
          return true
        }
        const abort = () => {
          if (release()) reject(new DOMException('Aborted', 'AbortError'))
        }
        signal.addEventListener('abort', abort, { once: true })
        void current.promise.then(
          (value) => {
            if (release()) resolve(value as T)
          },
          (cause) => {
            if (release()) reject(cause)
          }
        )
      })
    },
    clear() {
      for (const entry of entries.values()) {
        clearTimeout(entry.timer)
        entry.controller.abort()
      }
      entries.clear()
    },
  }
}

export type ApiReadRequests = ReturnType<typeof createApiReadRequests>
