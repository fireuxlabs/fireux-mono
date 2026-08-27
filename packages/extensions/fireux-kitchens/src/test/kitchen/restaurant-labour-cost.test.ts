import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateRestaurantLabourCost } from '../../runtime/kitchen/utils/finance/restaurant-labour-cost.ts'

const chf = (amount_minor: number) => ({
  amount_minor,
  currency_code: 'CHF',
})

test('calculates total restaurant labour cost and percentage deterministically', () => {
  const result = calculateRestaurantLabourCost({
    sales: chf(2_000_000),
    wages: chf(420_000),
    employerCosts: chf(60_000),
    otherLabourCosts: chf(20_000),
  })

  assert.equal(result.totalLabourCost.amount_minor, 500_000)
  assert.equal(result.labourPercentage, 25)
  assert.equal(result.labourBasisPoints, 2_500)
})

test('rejects zero sales and mixed currencies', () => {
  assert.throws(() =>
    calculateRestaurantLabourCost({
      sales: chf(0),
      wages: chf(1),
      employerCosts: chf(0),
      otherLabourCosts: chf(0),
    })
  )
  assert.throws(() =>
    calculateRestaurantLabourCost({
      sales: chf(100),
      wages: { amount_minor: 10, currency_code: 'EUR' },
      employerCosts: chf(0),
      otherLabourCosts: chf(0),
    })
  )
})
