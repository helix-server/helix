import { expect, test } from 'bun:test'

test('Should false be false', () => {
	expect([true, false][1]).toBe(false)
})
