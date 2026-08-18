const LOCALIZED_TEXT_SCHEMA = {
  type: 'array',
  description:
    'Aligned language copies printed in the source document. Omit generated or inferred translations.',
  items: {
    type: 'object',
    properties: {
      language: {
        type: 'string',
        description:
          'Detected Sproochli language code such as en, de, fr, it, or gsw.',
      },
      text: { type: 'string' },
    },
    required: ['language', 'text'],
  },
} as const

export const MENU_EXTRACTION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          label_translations: LOCALIZED_TEXT_SCHEMA,
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                name_translations: LOCALIZED_TEXT_SCHEMA,
                description: { type: 'string' },
                description_translations: LOCALIZED_TEXT_SCHEMA,
                item_kind: {
                  type: 'string',
                  enum: ['food', 'drink'],
                },
                is_deal: { type: 'boolean' },
                image_url: { type: 'string' },
                price: { type: 'number' },
                price_options: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      label_translations: LOCALIZED_TEXT_SCHEMA,
                      price: {
                        type: 'number',
                        exclusiveMinimum: 0,
                        description:
                          'Absolute full item price for this required variant or included OR choice, never a surcharge or delta.',
                      },
                    },
                    required: ['label', 'label_translations', 'price'],
                  },
                },
                add_ons: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      label_translations: LOCALIZED_TEXT_SCHEMA,
                      price: {
                        type: 'number',
                        minimum: 0,
                        description:
                          'Incremental add-on surcharge. Use zero for a labelled optional free add-on.',
                      },
                    },
                    required: ['label', 'label_translations', 'price'],
                  },
                },
                source_file_ids: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
              required: [
                'name',
                'name_translations',
                'description',
                'description_translations',
                'item_kind',
                'is_deal',
                'image_url',
                'price',
                'price_options',
                'add_ons',
                'source_file_ids',
              ],
            },
          },
        },
        required: ['label', 'label_translations', 'items'],
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
