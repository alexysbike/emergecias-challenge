import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { CreateActivityUseCase } from "../../../application/activities/create-activity.use-case";
import { idParamSchema } from "../../validators/common.schemas";
import { createActivitySchema } from "../../validators/activity.schemas";
import { toActivityResponse } from "../../mappers/activity.mapper";

export class CreateActivityRoute extends HttpRoute {
  readonly path = "/";
  readonly methods = [HttpMethod.POST];

  constructor(private readonly useCase: CreateActivityUseCase) {
    super();
  }

  protected async post(req: HttpRequest) {
    const { id } = idParamSchema.parse(req.params);
    const input = createActivitySchema.parse(req.body);
    const activity = await this.useCase.execute({
      personId: id,
      ...input,
    });
    return toActivityResponse(activity);
  }
}
