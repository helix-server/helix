import type { Request } from '@helix-server/core'

class ContextService {
	private contexts: Map<string, unknown> = new Map()

	getContext<T = unknown>({ headers }: Request): T {
		const requestId = headers.get('X-Request-ID') as string
		if (!this.contexts.has(requestId)) {
			throw new Error('Context not found')
		}
		return this.contexts.get(requestId) as T
	}

	createContext({ headers }: Request): void {
		const requestId = headers.get('X-Request-ID') as string
		if (this.contexts.has(requestId)) {
			throw new Error('Context already exists')
		}
		this.contexts.set(requestId, {})
	}

	updateContext<T = unknown>(req: Request, key: string, value: T): void {
		const context = this.getContext<Record<string, unknown>>(req)
		context[key] = value
	}

	deleteContext({ headers }: Request): void {
		const requestId = headers.get('X-Request-ID') as string
		if (!this.contexts.has(requestId)) {
			throw new Error('Context not found')
		}
		this.contexts.delete(requestId)
	}
}

const contextService: ContextService = new ContextService()
export default contextService
