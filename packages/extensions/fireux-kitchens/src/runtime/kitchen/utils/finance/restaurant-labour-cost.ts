import type { FinancialMoney } from 'fireux-finance/runtime/models/money.model'
import {
  addFinancialMoney,
  requireFinancialMoney,
} from 'fireux-finance/runtime/utils/money'

export type RestaurantLabourCostInput = {
  sales: FinancialMoney
  wages: FinancialMoney
  employerCosts: FinancialMoney
  otherLabourCosts: FinancialMoney
}

export type RestaurantLabourCostResult = {
  sales: FinancialMoney
  totalLabourCost: FinancialMoney
  labourPercentage: number
  labourBasisPoints: number
  breakdown: {
    wages: FinancialMoney
    employerCosts: FinancialMoney
    otherLabourCosts: FinancialMoney
  }
}

export function calculateRestaurantLabourCost(
  input: RestaurantLabourCostInput
): RestaurantLabourCostResult {
  const sales = requireFinancialMoney(input.sales, {
    allowNegative: false,
    allowZero: false,
    label: 'Sales',
  })
  const wages = labourMoney(input.wages, 'Wages')
  const employerCosts = labourMoney(input.employerCosts, 'Employer costs')
  const otherLabourCosts = labourMoney(
    input.otherLabourCosts,
    'Other labour costs'
  )
  const totalLabourCost = addFinancialMoney(
    [wages, employerCosts, otherLabourCosts],
    'Total labour cost'
  )
  if (totalLabourCost.currency_code !== sales.currency_code) {
    throw new Error('Sales and labour costs must use the same currency.')
  }
  const labourBasisPoints = Math.round(
    (totalLabourCost.amount_minor / sales.amount_minor) * 10_000
  )

  return {
    sales,
    totalLabourCost,
    labourPercentage: labourBasisPoints / 100,
    labourBasisPoints,
    breakdown: { wages, employerCosts, otherLabourCosts },
  }
}

function labourMoney(value: FinancialMoney, label: string) {
  return requireFinancialMoney(value, {
    allowNegative: false,
    label,
  })
}
