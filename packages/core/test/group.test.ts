import { describe, expect, test } from 'bun:test'
import { type Ctx, Helix, Middleware } from '../src'

const call = (app: Helix, path: string, method = 'GET') =>
	app.fetch(new Request(`http://localhost${path}`, { method }))

class Tag extends Middleware<[string?]> {
	async handle(
		ctx: Ctx,
		next: () => Promise<void>,
		tag = 'tag',
	): Promise<void> {
		ctx.res.appendHeader('x-tags', tag)
		await next()
	}
}

class Other extends Middleware {
	async handle(ctx: Ctx, next: () => Promise<void>): Promise<void> {
		ctx.res.appendHeader('x-tags', 'other')
		await next()
	}
}

describe('Helix.group', () => {
	test('prefixes routes and keeps route params', async () => {
		const app = new Helix()
		app.group({ prefix: '/api' }, (api) => {
			api.get({
				route: '/users/:id',
				handler: async (ctx) => {
					ctx.res.setBody(`user ${ctx.req.getParam('id')}`)
				},
			})
			api.post({
				route: '/users',
				handler: async (ctx) => {
					ctx.res.setStatus(201)
				},
			})
		})
		app.load()

		const res = await call(app, '/api/users/7')
		expect(res.status).toBe(200)
		expect(await res.text()).toBe('user 7')
		expect((await call(app, '/api/users', 'POST')).status).toBe(201)
		expect((await call(app, '/users/7')).status).toBe(404)
	})

	test('normalizes slashes between prefix and route', async () => {
		const app = new Helix()
		const handler = async (ctx: Ctx) => {
			ctx.res.setBody('ok')
		}
		app.group({ prefix: 'api/' }, (api) => {
			api.get({ route: '/', handler })
			api.get({ route: 'health', handler })
			expect(api.prefix).toBe('/api')
		})
		app.load()

		expect((await call(app, '/api')).status).toBe(200)
		expect((await call(app, '/api/health')).status).toBe(200)
	})

	test('supports nested groups', async () => {
		const app = new Helix()
		app.group({ prefix: '/api' }, (api) => {
			api.group({ prefix: '/v1' }, (v1) => {
				v1.get({
					route: '/ping',
					handler: async (ctx) => {
						ctx.res.setBody('pong')
					},
				})
			})
		})
		app.load()

		const res = await call(app, '/api/v1/ping')
		expect(await res.text()).toBe('pong')
	})

	test('applies group middlewares to every route, including nested ones', async () => {
		const app = new Helix()
		app.group({ prefix: '/a', middlewares: [{ class: Tag }] }, (a) => {
			a.get({ route: '/x', handler: async () => {} })
			a.group({ prefix: '/b', middlewares: [{ class: Other }] }, (b) => {
				b.get({ route: '/y', handler: async () => {} })
			})
		})
		app.get({ route: '/outside', handler: async () => {} })
		app.load()

		expect((await call(app, '/a/x')).headers.get('x-tags')).toBe('tag')
		const nested = (await call(app, '/a/b/y')).headers.get('x-tags') ?? ''
		expect(nested.split(', ').sort()).toEqual(['other', 'tag'])
		expect((await call(app, '/outside')).headers.get('x-tags')).toBeNull()
	})

	test('route middleware args override the group ones', async () => {
		const app = new Helix()
		app.group(
			{ prefix: '/g', middlewares: [{ class: Tag, args: ['group'] }] },
			(g) => {
				g.get({ route: '/default', handler: async () => {} })
				g.get({
					route: '/custom',
					middlewares: [{ class: Tag, args: ['route'] }],
					handler: async () => {},
				})
			},
		)
		app.load()

		expect((await call(app, '/g/default')).headers.get('x-tags')).toBe('group')
		expect((await call(app, '/g/custom')).headers.get('x-tags')).toBe('route')
	})
})
