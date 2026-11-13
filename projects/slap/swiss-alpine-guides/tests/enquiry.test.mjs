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
const activities = JSON.parse(readFileSync(new URL('../app/content/activities.json', import.meta.url), 'utf8'))
const operatorSource = readFileSync(new URL('../app/content/operator.ts', import.meta.url), 'utf8').replace(/^export /gm, '')
const operator = compileFunction(`${stripTypeScriptTypes(operatorSource)};return operator`)()
const optionsSource = readFileSync(new URL('../app/content/enquiry-options.ts', import.meta.url), 'utf8').replace(/^import .*$/gm, '').replace(/^export /gm, '')
const enquiryOptions = compileFunction(`${stripTypeScriptTypes(optionsSource)};return enquiryOptions`, ['activities', 'tours', 'operator'])(activities, tours, operator)
const source = readFileSync(
  new URL('../server/utils/enquiry.ts', import.meta.url),
  'utf8'
)
  .replace(/^import .*$/gm, '')
  .replace(/^export /gm, '')
const { validateEnquiry, prepareEnquiryDraft } = compileFunction(
  `${stripTypeScriptTypes(source)};return {validateEnquiry,prepareEnquiryDraft}`,
  ['enquiryOptions']
)(enquiryOptions)
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
    assert.deepEqual(Object.keys(draft).sort(), ['body', 'subject', 'to'])
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

test('every activity and support enquiry uses the correct fixed operator recipient', () => {
  for (const option of enquiryOptions) {
    const draft = prepareEnquiryDraft({ ...valid, tour: option.id, activity: option.heli ? 'ski' : 'other' })
    assert.equal(draft.to, option.heli ? 'heli1@swissalpineguides.ch' : 'info@swissalpineguides.ch')
    assert.ok(draft.body.includes(option.name))
    assert.match(draft.body, /not a confirmed booking/)
    if (!option.heli) assert.doesNotMatch(draft.body, /aircraft availability/)
  }
})
test('general enquiries reject unsupported activity types and recipient injection', () => {
  assert.throws(() => prepareEnquiryDraft({ ...valid, tour: 'via-ferrata', activity: 'ski' }))
  const result = prepareEnquiryDraft({ ...valid, tour: 'via-ferrata', activity: 'other', to: 'outsider@example.com' })
  assert.equal(result.to, 'info@swissalpineguides.ch')
})
