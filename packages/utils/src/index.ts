import helix from '@helix-server/core'
import { AllErrorHandler } from './middlewares/all-error-handler.middleware'
import { CreateRequestContext } from './middlewares/create-request-context.middleware'
import { CreateRequestId } from './middlewares/create-request-id.middleware'
import { ResponseFormatter } from './middlewares/response-formatter.middleware'
import { Time } from './middlewares/time.middleware'
import contextService from './services/context.service'

helix.registerMiddlewares([
	AllErrorHandler,
	ResponseFormatter,
	CreateRequestId,
	CreateRequestContext,
	Time,
])

export {
	AllErrorHandler,
	CreateRequestContext,
	CreateRequestId,
	ResponseFormatter,
	contextService,
	Time,
}
