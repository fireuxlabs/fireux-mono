import { defineNuxtPlugin } from '#imports'
import { useFireUXConfig } from '../composables/fireux/app/FireUXConfig'

export default defineNuxtPlugin(() => {
  const cfg = useFireUXConfig()
  return { provide: { fireuxConfig: cfg } }
})
