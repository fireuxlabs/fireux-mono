import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const catalogueSource = readFileSync(
  new URL('../app/content/tours.ts', import.meta.url),
  'utf8'
).replace(/^export /gm, '')
const tours = compileFunction(
  `${stripTypeScriptTypes(catalogueSource)};return tours`
)()
const source = readFileSync(
  new URL('../server/utils/enquiry.ts', import.meta.url),
  'utf8'
)
  .replace(/^import .*$/gm, '')
  .replace(/^export /gm, '')
const { validateEnquiry, prepareEnquiryDraft } = compileFunction(
  `${stripTypeScriptTypes(source)};return {validateEnquiry,prepareEnquiryDraft}`,
  ['tours']
)(tours)
const valid = {
  tour: 'ebnefluh',
  name: 'Client Example',
  email: 'client@example.com',
  phone: '',
  date: '2027-03-12',
  flexible: false,
  groupSize: 3,
  activity: 'ski',
  notes: 'Experienced group',
  website: '',
  acknowledgement: true,
}
test('all five tours prepare a draft without claiming a booking', () => {
  for (const tour of tours) {
    const draft = prepareEnquiryDraft({ ...valid, tour: tour.id })
    assert.match(draft.body, /not a confirmed booking/)
    assert.ok(draft.body.includes(tour.route))
    assert.deepEqual(Object.keys(draft).sort(), ['body', 'subject'])
    assert.doesNotMatch(draft.body, /CHF|available seats|booking confirmed/)
  }
})
test('rejects invalid contact, unknown tour, impossible date and unacknowledged request', () => {
  for (const change of [
    { email: 'a\r\nBcc: x@y.ch' },
    { tour: 'other' },
    { date: '2027-02-30' },
    { groupSize: 0 },
    { groupSize: 31 },
    { groupSize: 2.5 },
    { activity: 'climbing' },
    { acknowledgement: false },
    { website: 'spam' },
    { notes: 'x'.repeat(1501) },
  ])
    assert.throws(() => validateEnquiry({ ...valid, ...change }))
})
test('flexible requests need no date, while non-flexible requests do', () => {
  assert.equal(validateEnquiry({ ...valid, date: '', flexible: true }).date, '')
  assert.throws(() => validateEnquiry({ ...valid, date: '', flexible: false }))
})
test('names and notes remain ordinary text in the email body', () => {
  const draft = prepareEnquiryDraft({
    ...valid,
    name: '<b>Example</b>',
    notes: 'x & y?',
  })
  assert.ok(draft.body.includes('<b>Example</b>'))
  assert.ok(draft.body.includes('x & y?'))
})
