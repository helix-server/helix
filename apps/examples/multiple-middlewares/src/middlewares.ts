import helix, { Middleware, type Ctx } from "@helix-server/core";
import { AllErrorHandler, contextService } from "@helix-server/utils";

export class ErrorType1 extends Middleware {
  static override isGlobal = true;
  static override before = [AllErrorHandler];

  async handle(ctx: Ctx, next: () => Promise<void>): Promise<void> {
    try {
      await next();
    } catch (error: unknown) {
      if (!(error instanceof Error)) throw error;
      if (error.name === "error1") {
        ctx.res.setBody({
          errorMessage: "Un mensaje de error",
        });
      } else {
        throw error;
      }
    }
  }
}

export class ErrorType2 extends Middleware {
  static override isGlobal = true;
  static override before = [AllErrorHandler];

  async handle(ctx: Ctx, next: () => Promise<void>): Promise<void> {
    try {
      await next();
    } catch (error: unknown) {
      if (!(error instanceof Error)) throw error;
      if (error.name === "error2") {
        ctx.res.setBody({
          errorMessage: "Un mensaje de error",
        });
      } else {
        throw error;
      }
    }
  }
}

export class GetUser extends Middleware {
  async handle(ctx: Ctx, next: () => Promise<void>): Promise<void> {
    contextService.updateContext(ctx.req, "user", {
      id: 1,
      name: "John Doe",
    });
    await next();
    contextService.updateContext(ctx.req, "user", null);
  }
}

export class GetUserPlan extends Middleware {
  static override depends = [GetUser];

  async handle(ctx: Ctx, next: () => Promise<void>): Promise<void> {
    contextService.updateContext(ctx.req, "plan", {
      id: 4,
      name: "pro",
    });
    await next();
    contextService.updateContext(ctx.req, "plan", null);
  }
}

export class GetPost extends Middleware {
  async handle(ctx: Ctx, next: () => Promise<void>): Promise<void> {
    contextService.updateContext(ctx.req, "post", {
      id: 3,
      userId: 1,
      title: "Lorem Ipsum",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vitae elit ut urna imperdiet aliquam. Fusce mattis consectetur dolor, a consequat purus placerat vel. Nullam consectetur enim sed neque viverra tristique. Nunc ut blandit sapien, eu efficitur orci. Donec vehicula odio eget sem eleifend, in posuere leo dignissim. Donec erat mauris, cursus vitae dui porta, maximus sodales justo. Quisque vel justo at erat luctus cursus. Etiam non eros lacus. Etiam tincidunt porttitor nibh, in viverra justo. Nam eu imperdiet dui, id lobortis massa.",
    });
    await next();
    contextService.updateContext(ctx.req, "post", null);
  }
}

export class ValidateUserPermissions extends Middleware {
  static override depends = [GetUserPlan];

  async handle(ctx: Ctx, next: () => Promise<void>): Promise<void> {
    const context = contextService.getContext(ctx.req);
    const plan = context.plan;
    if (plan.name !== "pro") {
      throw new Error("Unauthorized");
    }
  }
}

export class ValidatePostOwner extends Middleware {
  static override depends = [GetUser, GetPost];

  async handle(ctx: Ctx, next: () => Promise<void>): Promise<void> {
    const context = contextService.getContext(ctx.req);
    const post = context.post;
    const user = context.user;
    if (post.userId !== user.id) {
      throw new Error("Unauthorized");
    }
  }
}

export class Other extends Middleware {
  static override depends = [GetPost];

  async handle(
    ctx: Ctx,
    next: () => Promise<void>,
    arg1: string,
    arg2: number,
    arg3: boolean
  ): Promise<void> {
    console.log(`[PRE]: ${this.constructor.name}`);
    console.log(`[ARGS]: ${arg1}, ${arg2}, ${arg3}`);
    await next();
    console.log(`[POST]: ${this.constructor.name}`);
  }
}

helix.registerMiddlewares([
  ErrorType1,
  ErrorType2,
  GetUser,
  GetUserPlan,
  GetPost,
  ValidateUserPermissions,
  ValidatePostOwner,
  Other,
]);
