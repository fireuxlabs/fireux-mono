export type KitchenOrderNumberingSequence = {
  id: string
  number: number
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export function applyKitchenOrderNumbering<
  TResponse extends Record<string, unknown>,
>(input: {
  payload: Record<string, unknown>
  response: TResponse
  sequence: KitchenOrderNumberingSequence
}) {
  const orderNumber = String(input.sequence.number)
  return {
    payload: {
      ...input.payload,
      order_number: orderNumber,
      service_id: input.sequence.id,
      service_number: input.sequence.number,
    },
    response: applyKitchenOrderNumberingToResponse(
      input.response,
      input.sequence
    ),
  }
}

export function applyKitchenOrderNumberingToResponse<
  TResponse extends Record<string, unknown>,
>(response: TResponse, sequence: KitchenOrderNumberingSequence) {
  const orderNumber = String(sequence.number)
  const receipt = record(response.receipt)

  return {
    ...response,
    order_number: orderNumber,
    service_id: sequence.id,
    service_number: sequence.number,
    ...(Object.keys(receipt).length
      ? {
          receipt: {
            ...receipt,
            order_number: orderNumber,
            service_id: sequence.id,
            service_number: sequence.number,
          },
        }
      : {}),
  } as TResponse
}
