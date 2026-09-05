import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { useTest } from './useTest'

type TestDerived = ReturnType<typeof useTest>['derived']['value']

export const testCapabilityDescription = {
  title: 'Test',
  purpose:
    'Create and manage small text records to prove how this workspace reads and changes data.',
  data: 'Each Test has an ID and one text value. Records belong to the selected workspace.',
  boundaries:
    'Test records do not change workspace identity or other capabilities. Changes use the same permissions and record allowance as the human controls.',
  ai: 'The AI composer currently drafts prompts and offers suggestions. It cannot submit changes yet.',
  tools: [
    {
      id: 'create',
      label: 'Create a Test',
      description:
        'Enter a non-empty text value. Confirming the form creates and selects a new record.',
    },
    {
      id: 'read',
      label: 'Read the Tests',
      description:
        'List the records and open a record’s detail page without changing it.',
    },
    {
      id: 'update',
      label: 'Update the selected Test',
      description:
        'Edit the selected record’s text value and confirm Save changes.',
    },
    {
      id: 'delete',
      label: 'Delete the selected Test',
      description:
        'Review the selected record and confirm its permanent removal.',
    },
  ],
} as const

export function useTestAI(derived: MaybeRefOrGetter<TestDerived>) {
  const tools = computed(() =>
    testCapabilityDescription.tools.map((tool) => ({
      ...tool,
      available: toValue(derived).capability.primitives[tool.id].available,
    }))
  )
  const suggestions = computed(() =>
    tools.value
      .filter((tool) => tool.available)
      .map((tool) => ({ label: tool.label }))
  )
  return { description: testCapabilityDescription, tools, suggestions }
}
