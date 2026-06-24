export const MENU_EXTRACTION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                price: { type: 'number' },
                price_options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      price: { type: 'number' },
                    },
                    required: ['label', 'price'],
                  },
                },
                source_file_ids: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: [
                'name',
                'description',
                'price',
                'price_options',
                'source_file_ids',
              ],
            },
          },
        },
        required: ['label', 'items'],
      },
    },
    notes: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['sections', 'notes'],
} as const

export const MENU_NORMALIZATION_JSON_SCHEMA = {
  ...MENU_EXTRACTION_JSON_SCHEMA,
  properties: {
    ...MENU_EXTRACTION_JSON_SCHEMA.properties,
    changes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          from: { type: 'string' },
          to: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['from', 'to', 'reason'],
      },
    },
  },
  required: ['sections', 'notes', 'changes'],
} as const
