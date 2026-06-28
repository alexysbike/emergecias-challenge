import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { ListActivitiesUseCase } from "../../../application/activities/list-activities.use-case";
import { idParamSchema } from "../../validators/common.schemas";
import { listActivitiesQuerySchema } from "../../validators/activity.schemas";
import { toActivityWithContactResponse } from "../../mappers/activity.mapper";

export class ListActivitiesRoute extends HttpRoute {
  readonly path = "/";
  readonly methods = [HttpMethod.GET];

  constructor(private readonly useCase: ListActivitiesUseCase) {
    super();
  }

  protected async get(req: HttpRequest) {
    const { id } = idParamSchema.parse(req.params);
    const query = listActivitiesQuerySchema.parse(req.query);
    const activities = await this.useCase.execute({
      personId: id,
      activityType: query.activityType,
    });
    return activities.map(toActivityWithContactResponse);
  }
}
