import Request from './class/request'
import Response from './class/response'
import { Main } from './middlewares/main.middleware'
import type { MiddlewareType } from './types/middleware'
import type { RouteGroupOptions, RouteSimple, RouteType } from './types/route'

function matchRoute(
	pattern: string,
	pathname: string,
): Record<string, string> | null {
	const paramNames: string[] = []

	// Convertir :nombre en grupos de captura regex
	const regexPattern = pattern.replace(/:([^/]+)/g, (_, paramName) => {
		paramNames.push(paramName)
		return '([^/]+)'
	})

	const regex = new RegExp(`^${regexPattern}$`)
	const match = pathname.match(regex)

	if (!match) return null

	// Construir objeto con los parámetros extraídos
	const params: Record<string, string> = {}
	paramNames.forEach((name, index) => {
		params[name] = match[index + 1] ?? ''
	})

	return params
}

export class Helix {
	private middlewares: MiddlewareType[] = []
	private tempRoutes: RouteType[] = []

	async run(port: number = 3000, host: string = '0.0.0.0'): Promise<void> {
		this.load()
		console.log(`Server running at http://${host}:${port}`)
		const { serve } = await import('bun')
		serve({
			port,
			hostname: host,
			fetch: (req) => this.fetch(req),
		})
	}

	async fetch(req: globalThis.Request): Promise<globalThis.Response> {
		const url = new URL(req.url)
		const method = req.method.toLowerCase()
		const result = this.tempRoutes
			.map((x) => ({
				route: x,
				params: x.method === method ? matchRoute(x.route, url.pathname) : null,
			}))
			.find((x) => x.params !== null)

		if (!result) return Response.create(404).setBody('Not found').toResponse()

		const { route, params } = result
		const response = Response.create()
		const request = await Request.create(req, params as Record<string, string>)

		const instances = [
			...Array.from(route.requiredMiddlewares).map(
				(middleware) => new middleware(),
			),
			Main.create(route.handler),
		]
		instances.forEach((instance) => {
			instance.prepare(instances)
		})
		await Promise.all(
			instances.map((instance) => {
				const middleware = route.middlewares?.find(
					(x) => x.class.name === instance.constructor.name,
				)
				if (!middleware || !middleware.args) {
					return instance.run(request, response)
				}
				return instance.run(request, response, middleware.args)
			}),
		)

		return response.toResponse()
	}

	registerMiddlewares(middlewares: MiddlewareType[]): void {
		this.middlewares.push(...middlewares)
	}

	registerMiddleware(middleware: MiddlewareType): void {
		this.middlewares.push(middleware)
	}

	get(routeData: RouteSimple): void {
		this.newRoute({
			route: routeData.route,
			handler: routeData.handler,
			middlewares: routeData.middlewares,
			method: 'get',
			requiredMiddlewares: new Set(),
		})
	}

	post(routeData: RouteSimple): void {
		this.newRoute({
			...routeData,
			method: 'post',
			requiredMiddlewares: new Set(),
		})
	}

	put(routeData: RouteSimple): void {
		this.newRoute({
			...routeData,
			method: 'put',
			requiredMiddlewares: new Set(),
		})
	}

	delete(routeData: RouteSimple): void {
		this.newRoute({
			...routeData,
			method: 'delete',
			requiredMiddlewares: new Set(),
		})
	}

	patch(routeData: RouteSimple): void {
		this.newRoute({
			...routeData,
			method: 'patch',
			requiredMiddlewares: new Set(),
		})
	}

	group(options: RouteGroupOptions, define: (group: RouteGroup) => void): void {
		define(new RouteGroup(this, options.prefix ?? '', options.middlewares))
	}

	newRoute(routeData: RouteType): void {
		routeData.middlewares?.forEach((middleware) => {
			if (!middleware.class) return
			if (this.middlewares.includes(middleware.class)) return
			this.registerMiddleware(middleware.class)
		})
		this.tempRoutes.push(routeData)
	}

	load(): void {
		this.tempRoutes.forEach((route) => {
			const { middlewares } = route
			const loadChilds = (middlewares: MiddlewareType[]) => {
				middlewares.forEach((middleware: MiddlewareType) => {
					if (route.requiredMiddlewares.has(middleware)) return
					route.requiredMiddlewares.add(middleware)
					loadChilds(middleware.depends)
					loadChilds(middleware.before)
				})
			}

			this.middlewares
				.filter((m) => m.isGlobal)
				.forEach((m) => {
					route.requiredMiddlewares.add(m)
				})

			middlewares?.forEach((middleware) => {
				if (!middleware.class) return
				route.requiredMiddlewares.add(middleware.class)
				loadChilds(middleware.class.depends)
				loadChilds(middleware.class.before)
			})
		})
	}
}

function joinPaths(prefix: string, route: string): string {
	const joined = `/${prefix}/${route}`.replace(/\/{2,}/g, '/')
	return joined.length > 1 ? joined.replace(/\/$/, '') : joined
}

/**
 * A set of routes sharing a path prefix and a list of middlewares.
 * Group middlewares run before the route's own; if a route declares the
 * same middleware class, its entry (and args) take precedence.
 */
export class RouteGroup {
	readonly #helix: Helix
	readonly #prefix: string
	readonly #middlewares: NonNullable<RouteSimple['middlewares']>

	constructor(
		helix: Helix,
		prefix: string,
		middlewares: RouteSimple['middlewares'] = [],
	) {
		this.#helix = helix
		this.#prefix = prefix
		this.#middlewares = middlewares
	}

	get prefix(): string {
		return joinPaths(this.#prefix, '')
	}

	get(routeData: RouteSimple): void {
		this.#helix.get(this.#resolve(routeData))
	}

	post(routeData: RouteSimple): void {
		this.#helix.post(this.#resolve(routeData))
	}

	put(routeData: RouteSimple): void {
		this.#helix.put(this.#resolve(routeData))
	}

	delete(routeData: RouteSimple): void {
		this.#helix.delete(this.#resolve(routeData))
	}

	patch(routeData: RouteSimple): void {
		this.#helix.patch(this.#resolve(routeData))
	}

	group(options: RouteGroupOptions, define: (group: RouteGroup) => void): void {
		define(new RouteGroup(
			this.#helix,
			joinPaths(this.#prefix, options.prefix ?? ''),
			this.#merge(options.middlewares),
		))
	}

	#merge(
		middlewares: RouteSimple['middlewares'] = [],
	): NonNullable<RouteSimple['middlewares']> {
		const overridden = new Set(middlewares.map((m) => m.class))
		return [
			...this.#middlewares.filter((m) => !overridden.has(m.class)),
			...middlewares,
		]
	}

	#resolve(routeData: RouteSimple): RouteSimple {
		return {
			route: joinPaths(this.#prefix, routeData.route),
			handler: routeData.handler,
			middlewares: this.#merge(routeData.middlewares),
		}
	}
}

export default new Helix() as Helix
