import { computed, ref } from 'vue'
import { useCurrentAppContext } from 'fireux-core/runtime/app/composables/useCurrentAppContext'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  appSubscriptionCapacity,
  hasAppSubscriptionCapacity,
} from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { useProjectWorkspaceIndex } from 'fireux-core/runtime/project/composables/workspace/index/useProjectWorkspaceIndex'

export type ProjectTest = { name: string }

export function useProjectWorkspaceTest() {
  const workspace = useProjectWorkspaceIndex()
  const fireux = useFireUXConfig()
  const { membership } = useCurrentAppContext()
  const tests = ref<ProjectTest[]>([])
  const selectedIndex = ref(-1)
  const bold = ref(false)

  const limit = computed(() => {
    return appSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'project.test',
      membership.value?.subscription || 'free',
    )
  })

  const state = computed(() => ({
    ...workspace.state.value,
    tests: tests.value,
    selectedIndex: selectedIndex.value,
    bold: bold.value,
  }))
  const derived = computed(() => ({
    ...workspace.derived.value,
    limit: limit.value,
    canCreateTest: hasAppSubscriptionCapacity(
      fireux.subscriptionCapacity,
      'project.test',
      membership.value?.subscription || 'free',
      tests.value.length
    ),
  }))

  function select(index: number) {
    selectedIndex.value = tests.value[index] ? index : -1
    bold.value = false
  }

  function create(name: string) {
    const value = name.trim()
    if (
      !value ||
      !hasAppSubscriptionCapacity(
        fireux.subscriptionCapacity,
        'project.test',
        membership.value?.subscription || 'free',
        tests.value.length
      )
    )
      return
    tests.value.push({ name: value })
    selectedIndex.value = tests.value.length - 1
  }

  function update(name: string) {
    const value = name.trim()
    if (!value || !tests.value[selectedIndex.value]) return
    tests.value[selectedIndex.value] = { name: value }
  }

  function remove() {
    if (!tests.value[selectedIndex.value]) return
    tests.value.splice(selectedIndex.value, 1)
    selectedIndex.value = tests.value.length ? 0 : -1
    bold.value = false
  }

  function transform(change: (name: string) => string) {
    const selected = tests.value[selectedIndex.value]
    if (!selected) return
    tests.value[selectedIndex.value] = { name: change(selected.name) }
  }

  function capitalize() {
    transform((name) => name.charAt(0).toUpperCase() + name.slice(1))
  }

  function uppercase() {
    transform((name) => name.toUpperCase())
  }

  function lowercase() {
    transform((name) => name.toLowerCase())
  }

  function toggleBold() {
    if (tests.value[selectedIndex.value]) bold.value = !bold.value
  }

  return {
    state,
    derived,
    actions: {
      ...workspace.actions,
      create,
      select,
      update,
      remove,
      capitalize,
      uppercase,
      lowercase,
      toggleBold,
    },
  }
}
