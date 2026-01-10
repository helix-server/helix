import { type Ctx, Middleware } from '@helix-server/core'

export class Time extends Middleware {
	static override isGlobal = true

	async handle(_ctx: Ctx, next: () => Promise<void>): Promise<void> {
		const start = Date.now()
		await next()
		const end = Date.now()
		console.log(`[TIME]: ${end - start}ms`)
	}
}
