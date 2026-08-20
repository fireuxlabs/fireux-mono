export const kitchenMisePrepTaskDeleteTool = {
  id: 'kitchen.mise.delete-prep-task',
  mode: 'write',
  risk: 'destructive',
  confirmation: 'required',
  context: {
    target: 'KitchenMiseTask',
    instruction: 'Permanently delete one prep task.',
    outcome: 'The prep task is removed from the selected Kitchen.',
  },
  surfaces: {
    human: {
      placement: 'record',
      group: 'update',
      label: 'Delete prep task',
      description: 'Permanently remove the task.',
      icon: 'i-lucide-trash-2',
    },
    agent: { callable: false },
  },
} as const
