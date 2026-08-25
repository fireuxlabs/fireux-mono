export const kitchenWasteEventRecordTool = {
  id: 'kitchen.waste.record-event',
  mode: 'write',
  risk: 'write',
  confirmation: 'none',
  context: {
    target: 'KitchenWasteEvent',
    instruction: 'Record one observed Waste event in the selected Kitchen.',
    outcome: 'One immutable, actor-stamped Waste event is recorded.',
    constraints: [
      'Records only the operator-supplied observation.',
      'Does not adjust Inventory or infer cost, cause, savings, or prevention.',
    ],
  },
  inputSchema: {
    type: 'object',
    properties: {
      item_name: { type: 'string', minLength: 1, maxLength: 300 },
      quantity: { type: 'number', exclusiveMinimum: 0, maximum: 1000000 },
      unit: { type: 'string', minLength: 1, maxLength: 80 },
      reason: {
        type: 'string',
        enum: [
          'spoilage',
          'preparation',
          'overproduction',
          'cooking_error',
          'returned',
          'other',
        ],
      },
      source: {
        type: 'string',
        enum: [
          'storage',
          'prep',
          'production',
          'service',
          'customer_return',
          'other',
        ],
      },
      notes: { type: 'string', maxLength: 5000 },
    },
    required: ['item_name', 'quantity', 'unit', 'reason', 'source'],
    additionalProperties: false,
  },
  surfaces: {
    human: {
      placement: 'toolbar',
      group: 'create',
      label: 'Record Waste',
      description: 'Record one observed Waste event.',
      icon: 'i-lucide-trash-2',
    },
    agent: { callable: false },
  },
  result: { kind: 'object' },
} as const
