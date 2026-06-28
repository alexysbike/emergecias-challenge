import express, { type Express } from "express";
import pinoHttp from "pino-http";
import type { Logger as PinoLogger } from "pino";
import { HttpServer } from "../http-server";
import type { HttpServerConfig } from "../http-server";
import { flattenRouters, toExpressMethod } from "../path-utils";
import { adaptRequest } from "./adapters/express-request.adapter";
import { adaptResponse } from "./adapters/express-response.adapter";
import {
  asyncHandler,
  wrapErrorHandler,
  wrapMiddleware,
} from "./middleware/async-handler.middleware";
import { createErrorHandler } from "./middleware/error-handler.middleware";
import { registerSwaggerUi } from "./swagger-ui.setup";

export interface ExpressBuildConfig extends HttpServerConfig {
  pinoLogger: PinoLogger;
}

export function buildExpressApp(config: ExpressBuildConfig): Express {
  const app = express();
  app.use(pinoHttp({ logger: config.pinoLogger }));
  app.use(express.json());

  config.middlewares?.forEach((mw) => app.use(wrapMiddleware(mw)));

  for (const { path, route } of flattenRouters(config.routers)) {
    const handler = asyncHandler(async (req, res) => {
      await route.execute(adaptRequest(req), adaptResponse(res));
    });

    for (const method of route.methods) {
      app[toExpressMethod(method)](path, handler);
    }
  }

  app.use(wrapErrorHandler(createErrorHandler(config.logger)));
  registerSwaggerUi(app, config.env);

  return app;
}

export class ExpressHttpServer extends HttpServer {
  constructor(protected readonly config: ExpressBuildConfig) {
    super(config);
  }

  run(): void {
    const app = buildExpressApp(this.config);
    app.listen(this.config.port, () => {
      this.config.logger.info(`Server running on http://localhost:${this.config.port}`);
    });
  }
}
