import { type Ctx, Middleware } from '@helix-server/core'
import contextService from '../services/context.service'
import { CreateRequestId } from './create-request-id.middleware'

export class CreateRequestContext extends Middleware {
	static override isGlobal = true
	static override depends: (typeof CreateRequestId)[] = [CreateRequestId]

	async handle(ctx: Ctx, next: () => Promise<void>): Promise<void> {
		contextService.createContext(ctx.req)
		await next()
		contextService.deleteContext(ctx.req)
	}
}
