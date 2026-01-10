import helix from "@helix-server/core";
import "@helix-server/utils";
import "./middlewares";
import {
  Other,
  ValidatePostOwner,
  ValidateUserPermissions,
} from "./middlewares";

helix.get({
  route: "/t1",
  handler: async (ctx) => {
    ctx.res.setBody("t1");
  },
});

helix.get({
  route: "/t2",
  middlewares: [
    {
      class: ValidateUserPermissions,
    },
    {
      class: ValidatePostOwner,
    },
  ],
  handler: async (ctx) => {
    ctx.res.setJsonBody({
      load: "t2",
    });
  },
});

helix.get({
  route: "/t3",
  middlewares: [
    {
      class: Other,
      args: ["arg1", "arg2", "arg3"],
    },
  ],
  handler: async (ctx) => {
    ctx.res.setBody("t3");
  },
});

helix.get({
  route: "/t4/:someId",
  handler: async (ctx) => {
    ctx.res.setBody(
      `t4 ${ctx.req.getParam("someId")} ${ctx.req.queryParams.get("q")}`
    );
  },
});

helix.post({
  route: "/t5/:someId",
  handler: async (ctx) => {
    console.log(ctx.req.getBody());
    const file = ctx.req.getBodyField("file") as Blob;
    console.log((await file.arrayBuffer()).byteLength);
    ctx.res.setBody(
      `t5 ${ctx.req.getParam("someId")} ${ctx.req.queryParams.get(
        "q"
      )} ${JSON.stringify(ctx.req.getBody())}`
    );
  },
});

helix.run(8080, "127.0.0.1");
