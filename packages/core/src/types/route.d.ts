import type { Ctx, MiddlewareType } from './middleware'

export type RouteSimple = {
	route: string
	handler: (data: Ctx) => Promise<void>
	middlewares?: { class: MiddlewareType; args?: unknown[] }[]
}

export type RouteType = RouteSimple & {
	method: string
	requiredMiddlewares: Set<MiddlewareType>
	middlewares?: { class: MiddlewareType; args?: unknown[] }[]
}

export type RouteGroupOptions = {
	prefix?: string
	middlewares?: RouteSimple['middlewares']
}
