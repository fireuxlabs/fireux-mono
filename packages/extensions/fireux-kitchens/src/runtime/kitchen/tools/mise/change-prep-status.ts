export const kitchenMisePrepStatusChangeTool = {
  id: 'kitchen.mise.change-prep-status',
  mode: 'write',
  risk: 'write',
  confirmation: 'none',
  context: {
    target: 'KitchenMiseTask',
    instruction: 'Change the working status of one prep task.',
    outcome: 'The prep board shows the current task status.',
  },
  surfaces: {
    human: {
      placement: 'record',
      group: 'update',
      label: 'Change prep status',
      description: 'Move a task through its working states.',
      icon: 'i-lucide-list-checks',
    },
    agent: { callable: false },
  },
} as const
