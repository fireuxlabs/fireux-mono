export const kitchenMisePrepTaskUpdateTool = {
  id: 'kitchen.mise.update-prep-task',
  mode: 'write',
  risk: 'write',
  confirmation: 'none',
  context: {
    target: 'KitchenMiseTask',
    instruction: 'Update one prep task in the selected Kitchen.',
    outcome: 'The prep task contains the reviewed changes.',
  },
  surfaces: {
    human: {
      placement: 'record',
      group: 'update',
      label: 'Update prep task',
      description: 'Update the task details.',
      icon: 'i-lucide-pencil',
    },
    agent: { callable: false },
  },
} as const
