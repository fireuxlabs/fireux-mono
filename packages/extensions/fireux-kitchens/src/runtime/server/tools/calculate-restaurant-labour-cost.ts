import { financialMoneyFromDecimal } from 'fireux-finance/runtime/utils/money'
import { calculateRestaurantLabourCost } from '../../tools/team/restaurant-labour-cost'

type RestaurantLabourCostToolInput = {
  sales: number
  wages: number
  employerCosts?: number
  otherLabourCosts?: number
  currencyCode?: string
}

export const restaurantLabourCostTool = {
  id: 'kitchen.finance.calculate-labour-cost',
  mode: 'calculate',
  confirmation: 'none',
  description:
    'Calculate restaurant labour cost and labour percentage from supplied figures.',
} as const

export function calculateRestaurantLabourCostTool(
  input: RestaurantLabourCostToolInput
) {
  const currencyCode = String(input.currencyCode || 'CHF').toUpperCase()
  const money = (amount: number, label: string) =>
    financialMoneyFromDecimal({
      amount,
      currencyCode,
      minorUnitDigits: 2,
      allowNegative: false,
      label,
    })

  return calculateRestaurantLabourCost({
    sales: money(input.sales, 'Sales'),
    wages: money(input.wages, 'Wages'),
    employerCosts: money(input.employerCosts ?? 0, 'Employer costs'),
    otherLabourCosts: money(input.otherLabourCosts ?? 0, 'Other labour costs'),
  })
}
