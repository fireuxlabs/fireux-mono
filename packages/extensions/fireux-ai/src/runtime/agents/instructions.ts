export const fireuxAgentBaseInstruction =
  'Understand the user\u2019s request. Consider the registered tools, available context, records, and permissions before deciding how to respond. Use tools when appropriate. Do not default to summarising records.'

export function composeFireuxAgentInstruction(
  ...instructions: readonly (string | undefined)[]
) {
  return instructions
    .map((instruction) => instruction?.trim())
    .filter((instruction): instruction is string => Boolean(instruction))
    .join(' ')
}
