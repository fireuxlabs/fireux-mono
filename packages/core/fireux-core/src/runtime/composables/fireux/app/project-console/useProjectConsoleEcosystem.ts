import { computed } from 'vue'

export function useProjectConsoleEcosystem() {
  return {
    ecosystem: computed(() => null),
    ecosystemProfile: computed(() => null),
    pending: computed(() => false),
  }
}
