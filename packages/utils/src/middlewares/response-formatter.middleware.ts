import { type Ctx, Middleware } from '@helix-server/core'
import { AllErrorHandler } from './all-error-handler.middleware'

export class ResponseFormatter extends Middleware {
	static override isGlobal = true
	static override depends: (typeof AllErrorHandler)[] = [AllErrorHandler]

	async handle(ctx: Ctx, next: () => Promise<void>): Promise<void> {
		await next()
		const contentType = ctx.res.headers.get('Content-Type')
		if (contentType !== 'application/json') {
			return
		}
		if (!ctx.res.body) return
		const body = JSON.parse(ctx.res.body.toString())

		ctx.res.setBody(
			JSON.stringify({
				status: ctx.res.status.toString().startsWith('2') ? 'OK' : 'ERROR',
				message: body.errorMessage ?? '',
				body: body.errorMessage ? null : body,
			}),
		)
	}
}
