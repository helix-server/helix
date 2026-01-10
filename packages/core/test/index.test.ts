import { expect, test } from 'bun:test'

test('Should true be true', () => {
	expect([true, false][0]).toBe(true)
})
