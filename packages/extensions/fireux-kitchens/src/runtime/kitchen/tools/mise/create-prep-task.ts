export const kitchenMisePrepTaskCreateTool = {
  id: 'kitchen.mise.create-prep-task',
  mode: 'write',
  risk: 'write',
  confirmation: 'none',
  context: {
    target: 'KitchenMiseTask',
    instruction: 'Add one prep task to the selected Kitchen.',
    outcome: 'A prep task is available on the Mise board.',
  },
  surfaces: {
    human: {
      placement: 'toolbar',
      group: 'create',
      label: 'Add prep task',
      description: 'Add work to the prep list.',
      icon: 'i-lucide-list-plus',
    },
    agent: { callable: false },
  },
} as const
