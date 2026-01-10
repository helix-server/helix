import { type Ctx, Middleware } from '@helix-server/core'
import { randomUUIDv7 } from 'bun'

export class CreateRequestId extends Middleware {
	static override isGlobal = true

	async handle(ctx: Ctx, next: () => Promise<void>): Promise<void> {
		ctx.req.setHeader('X-Request-ID', randomUUIDv7())
		await next()
		ctx.req.setHeader('X-Request-ID', '')
	}
}
