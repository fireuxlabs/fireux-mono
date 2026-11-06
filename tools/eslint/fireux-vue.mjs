// Bounded enforcement for the shared App foundation while other UI debt is reviewed.
const utility =
  /^(?:(?:[\w-]+|\[[^\]]+\]):)*(?:!?)(?:flex|grid|block|inline|inline-flex|inline-block|hidden|contents|relative|absolute|fixed|sticky|static|container|group|peer|select-none|pointer-events-(?:none|auto)|(?:flex|grid|items|justify|content|self|place-items|gap|gap-x|gap-y|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|min-w|max-w|min-h|max-h|size|text|font|leading|tracking|bg|border|rounded|shadow|opacity|z|top|bottom|left|right|inset|overflow|object|cursor|transition|duration|backdrop-blur)-[^\s]+|border|rounded|shadow|truncate|underline|antialiased)$/
function hasUtility(value) {
  return (
    typeof value === 'string' &&
    value.split(/\s+/).some((token) => utility.test(token))
  )
}

const noUtilities = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      utility:
        'Use semantic styles and native component props; authored utility classes are prohibited.',
    },
  },
  create(context) {
    const services = context.sourceCode.parserServices
    const literal = (node) => {
      if (hasUtility(node.value)) context.report({ node, messageId: 'utility' })
    }
    return services.defineTemplateBodyVisitor(
      {
        VAttribute(node) {
          if (
            !node.directive &&
            ['class', 'ui'].includes(node.key.name) &&
            node.value
          )
            literal(node.value)
        },
        Literal: literal,
        TemplateElement(node) {
          if (hasUtility(node.value.raw))
            context.report({ node, messageId: 'utility' })
        },
      },
      { Literal: literal }
    )
  },
}

const blockOrder = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      order: 'Use template, then script setup, then style; omit empty blocks.',
      setup: 'Use script setup for authored Vue components.',
    },
  },
  create(context) {
    return {
      Program() {
        const fragment = context.sourceCode.parserServices.getDocumentFragment()
        const order = { template: 0, script: 1, style: 2 }
        let previous = -1
        for (const node of fragment.children) {
          if (node.type !== 'VElement' || !(node.name in order)) continue
          const position = order[node.name]
          if (position < previous) context.report({ node, messageId: 'order' })
          previous = position
          if (
            node.name === 'script' &&
            !node.startTag.attributes.some(
              (attribute) => attribute.key.name === 'setup'
            )
          )
            context.report({ node, messageId: 'setup' })
        }
      },
    }
  },
}

export default {
  rules: { 'no-authored-utilities': noUtilities, 'block-order': blockOrder },
}
