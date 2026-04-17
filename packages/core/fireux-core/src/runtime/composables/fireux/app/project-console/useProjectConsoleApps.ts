import { computed } from 'vue'

export function useProjectConsoleApps() {
  return {
    apps: computed(() => [] as unknown[]),
    pending: computed(() => false),
  }
}
