import { type Ctx, Middleware } from '@helix-server/core'

export class AllErrorHandler extends Middleware {
	static override isGlobal = true

	async handle(_: Ctx, next: () => Promise<void>): Promise<void> {
		await next()
	}
}
